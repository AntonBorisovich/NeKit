const Discord = require("discord.js");
const http = require("http");

const PChostname = "192.168.10.67";
const PCport = "7860";
const defBatch = 1;
const defSteps = 16;
const width = 512;
const height = 512;

let workingNow = {timestamp: 0, id: false, step: 0};
const boolToString = {
	'false': 'нет',
	'true': 'да'
}
const secToMin = (seconds) => {
	const mins = Math.floor(seconds / 60);
	let secs = seconds - mins * 60;
	if (secs < 10) secs = "0" + secs;
	return mins + ":" + secs;
}
const interruptTask = async (nek, client, interaction) => {
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/interrupt',
		method: 'POST',
		headers: {}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
		const req = http.request(options, (res) => { // обращаемся к серваку
			res.on('end', () => {
				resolve(true)
			});
		});
		req.on('error', (e) => {
			console.log(e)
			resolve(false);
		});
		req.end();
	})
}

const checkProgress = async () => {
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/progress',
		method: 'GET',
		headers: {}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
		const req = http.request(options, (res) => { // обращаемся к серваку
			let data = "";
			res.on('data', (d) => {
				data = data + d;
			});
			res.on('end', () => {
				try {
					//console.log(data)
					resolve(JSON.parse(data));
				} catch(e) {
					console.error(e);
					resolve(false);
				}
			});
		});
		req.on('error', (e) => {
			console.log(e)
			resolve(false);
		});
		req.end();
	})
}
const txt2img = async (nek, client, interaction) => {
	if (!workingNow.id) workingNow = {timestamp: Date.now(), id: interaction.message.id, step: workingNow.step+1}
	if (interaction.message.id != workingNow.id) {
		let embed = new Discord.EmbedBuilder()
			.setTitle('Подождите')
			.setColor(nek.config.errorcolor)
			.setDescription('Кто-то уже использует команду. Подождите несколько минут и попробуйте снова');
		await interaction.message.edit({ embeds: [embed], components: [] }); // запоминаем сообщение
		return;
	}
	const oldEmbed = interaction.message.embeds[0];
	const oldComponents = interaction.message.components;
	const positivePrompts = oldEmbed.fields[0].value.replace(/`/g, '');
	let negativePrompts = oldEmbed.fields[1].value.replace(/`/g, '');
	if (!negativePrompts) negativePrompts = "mutation, watermark, bad hands, bad fingers, bad anatomy, crooked fingers, crooked hands, ugly hands, ugly fingers, twisted fingers, non-anatomical fingers";
	if (!interaction.message.channel.nsfw) negativePrompts = negativePrompts + ", (nsfw, explicit, questionable, pussy, breasts, nipple, areolae, cum, pubic hair, penis:1.1)"
	const steps = oldEmbed.fields[2].value.replace(/`/g, '')
	let embed = new Discord.EmbedBuilder()
		.setTitle('Генерация')
		.setColor(nek.config.basecolor)
		.setDescription("Генерируем... 0% (0:00)");
	oldComponents.shift() // убираем selectList
	oldComponents[0].components[0].data.disabled = true; // выключаем кнопку "начать"
	oldComponents[0].components[0].data.style = 2; // меняем цвет кнопки "начать"
	oldComponents[0].components[1].data.disabled = false; // включаем кнопку "прервать"
	oldComponents[0].components[1].data.style = 4; // меняем цвет кнопки "прервать"
	await interaction.message.edit({ embeds: [embed], components: oldComponents});
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/txt2img',
		method: 'POST',
		headers: {}
	}
	const filterNsfw = !interaction.message.channel.nsfw
	const payload = {
		prompt: positivePrompts,
		negative_prompt: negativePrompts,
		steps: steps,
		batch_size: defBatch,
		width: width,
		height: height
		//override_settings: {
		//	"filter_nsfw": filterNsfw
		//
	}
	let previewCoolDown = 0;
	embed = new Discord.EmbedBuilder()
		.setTitle('Генерация')
		.setColor(nek.config.basecolor)
	let timerId = setInterval( async () => {
		const progress = await checkProgress();
		//console.log(progress);
		embed.setDescription("Генерируем... " + Math.floor(progress.progress * 100) + "% (" + secToMin(Math.floor(progress.eta_relative)) + ")");
		if (!progress.current_image) { // если предпросмотр ещё не готов
			await interaction.message.edit({ embeds: [embed] });
		} else if (previewCoolDown === 0) {
			previewCoolDown = 3;
			const imgBuffer = new Buffer.from(progress.current_image, "base64");
			embed.setImage('attachment://preview.png');
			await interaction.message.edit({ embeds: [embed], files: [{attachment: imgBuffer, name: "preview.png"}] });
		} else {
			await interaction.message.edit({ embeds: [embed] })
			previewCoolDown = previewCoolDown - 1;
		}
	}, 2000);
	
	const imgResult = await new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
		workingNow.step = workingNow.step+1;
		const req = http.request(options, (res) => { // обращаемся к серваку
			let data = "";
			res.on('data', (d) => {
				data = data + d;
			});
			res.on('end', () => {
				try {
					//console.log(data)
					resolve(JSON.parse(data));
				} catch(e) {
					console.error(e);
					resolve(false);
				}
			});
		});
		req.on('error', (e) => {
			console.log(e)
			resolve(false);
		});
		req.write(JSON.stringify(payload)); // пишем данные в сайт
		req.end();
	})
	clearInterval(timerId); // останавливаем проверку прогресса
	//console.log(imgResult)
	const imgBuffer = new Buffer.from(imgResult.images[0], "base64");
	embed = new Discord.EmbedBuilder()
		.setTitle('Готово')
		.setColor(nek.config.basecolor)
		.setDescription("Ваша кака, сэр")
		.setImage('attachment://result.png');
	await interaction.message.edit({ embeds: [embed], files: [{attachment: imgBuffer, name: "result.png"}], components: [] })
	workingNow = {timestamp: 0, id: false, step: 0};
	return;
}
const changeModel = async (nek, client, interaction) => {
	if (!workingNow.id) {
		workingNow = {timestamp: Date.now(), id: interaction.message.id, step: 1};
	}
	if (workingNow.id !== interaction.message.id) {
		let embed = new Discord.EmbedBuilder()
			.setTitle('Подождите')
			.setColor(nek.config.errorcolor)
			.setDescription('Кто-то уже использует команду. Подождите несколько минут и попробуйте снова');
		await interaction.message.edit({ embeds: [embed], components: [] }); // запоминаем сообщение
		return;
	}
	workingNow = {timestamp: Date.now(), id: interaction.message.id, step: workingNow.step+1};
	const currentStep = workingNow.step // запоминаем текущий шаг, что бы потом отследить АФК
	let oldEmbed = interaction.message.embeds[0];
	const oldComponents = interaction.message.components;

	let embed = new Discord.EmbedBuilder()
		.setTitle('Подождите')
		.setColor(nek.config.basecolor)
		.setDescription("Применение настроек...");
	await interaction.message.edit({ embeds: [embed], components: []})
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/options',
		method: 'POST',
		headers: {}
	}
	const optionsRequest = await new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
		const req = http.request(options, (res) => { // обращаемся к серваку
			let data = "";
			res.on('data', (d) => {
				data = data + d;
			});
			res.on('end', () => {
				try {
					resolve(JSON.parse(data));
				} catch(e) {
					console.error(e);
					resolve(false);
				}
			});
		});
		req.on('error', (e) => {
			console.log(e)
			resolve(false);
		});
		req.write('{"sd_model_checkpoint":"' + interaction.values[0] + '"}'); // пишем данные в сайт
		req.end();
	})
	oldEmbed.data.footer.text = 'Загружена модель ' + interaction.values[0] + '. Можно начинать!'; // заменяем футер
	oldComponents[1].components[0].data.disabled = false; // включаем кнопку "начать"
	oldComponents[1].components[0].data.style = 3; // меняем цвет кнопки "начать"
	await interaction.message.edit({ embeds: [oldEmbed], components: oldComponents})
	setTimeout(() => {
		if (workingNow.id === interaction.message.id && workingNow.step === currentStep) {
			const embedus = new Discord.EmbedBuilder()
				.setTitle('Черепаха')
				.setColor(nek.config.basecolor)
				.setDescription("Вы слишком долго ничего не делали. Операция отменена");
			interaction.message.edit({ embeds: [embedus], components: []})
			workingNow = {timestamp: 0, id: false, step: 0};
		}
	}, 30000
	);
	return;
}

class Neuro {
    constructor(nek){
		//задать полученые значения для дальнейшего использования в коде команды
		//this.version = "1.0";
		this.category = "img";
		this.perms = ["EMBED_LINKS", "ATTACH_FILES"];
		
		this.args = "<промпты>";
		this.advargs = "<промпты>";
		this.argsdesc = "<промпты> - слова на английском, перечисленные через запятую. Это такие тэги, которые дают понять нейронке, что вы от неё хотите. Например `1girl` рисует одну девушку, а `1girl, red eyes` рисует девушку с красными глазами";
        this.desc = "нейромазня";
        this.advdesc = "Это, наверное, самая эксперементальная команда. С помощью компьютера разработчика (если он включён) можно сгенерировать нейромазню.\n" +
		"Всякие ссылки на то, что помогает этому работать:\n"+
		"-[stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) - API, с помощью которого можно через бота опросить комп\n"+
		"-[Anything V5](https://civitai.com/models/9409) - модель AnythingV5\n"+
		"-[Anything V3](https://civitai.com/models/9409) - модель AnythingV3, совместимая с LoRA\n"+
		"-[Waifu Diffusion 1.5 beta 2](https://huggingface.co/waifu-diffusion/wd-1-5-beta2) - модель WD15\n";
        this.name = "neuro";
    }

    async run(nek, client, msg, args){
		args.shift();
		let embed;
		
		if (workingNow.id) {
			let embed = new Discord.EmbedBuilder()
				.setTitle('Подождите')
				.setColor(nek.config.errorcolor)
				.setDescription('Кто-то уже использует команду. Подождите несколько минут и попробуйте снова');
			const waitmsg = await msg.reply({ embeds: [embed] }); // запоминаем сообщение
			return
		}
		embed = new Discord.EmbedBuilder()
			.setTitle('Проверка соединения')
			.setColor(nek.config.basecolor)
			.setDescription("Идёт проверка хоста...");
		const waitmsg = await msg.reply({ embeds: [embed] }); // запоминаем сообщение
		const options = { // параметры обращения к серваку
			hostname: PChostname,
			port: PCport,
			path: '/sdapi/v1/sd-models',
			method: 'GET',
			headers: {}
		}
		const sdModels = await new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
			const req = http.request(options, (res) => { // обращаемся к серваку
				let data = "";
				res.on('data', (d) => {
					data = data + d;
				});
				res.on('end', () => {
					try {
						const resp = JSON.parse(data);
						if (!resp.Error) {
							resolve(resp);
						} else {
							resolve(false);
						}
					} catch(e) {
						console.error(e);
						resolve(false);
					}
				});
			});
			req.on('error', (e) => {
				console.log(e);
				resolve(false);
			});
			req.end();
		})
		//console.log(sdModels);
		if (!sdModels) {
			embed = new Discord.EmbedBuilder()
				.setTitle('Комп выключен')
				.setColor(nek.config.errorcolor)
				.setDescription("Хост не отвечает. Попробуйте позже");
			await waitmsg.edit({ embeds: [embed] }); // запоминаем сообщение
			return;
		}
		let sdModelsNames = []
		sdModels.forEach(model => {
			sdModelsNames.push(model.model_name);
		});
		
		// С этого момента все проверки пройдены, комп отвечает, можно обрабатывать запрос
		if (!args[0]) {
			embed = new Discord.EmbedBuilder()
				.setTitle('Соединение установлено, но делать нечего')
				.setColor(nek.config.errorcolor)
				.setDescription("Вы не указали промты ([Что это?](https://strikingloo.github.io/stable-diffusion-vs-dalle-2)). Пока что \"интерактивное заполнение аргументов\" не реализовано.\n"+
				"Попробуйте `" + nek.config.prefix + this.name + " puppy dog, gray hair` например.");
			await waitmsg.edit({ embeds: [embed] }); // запоминаем сообщение
			return;
		}
		
		const positivePrompts = args.join(' ');
		const negativePrompts = false;
		const steps = defSteps;
		//const NSFW = msg.channel.nsfw;
		embed = new Discord.EmbedBuilder()
			.setTitle('Соединение установлено')
			.setColor(nek.config.basecolor)
			.setDescription("Текущие настройки:")
			.addFields(
				{name: 'Положительные промты', value: '`' + positivePrompts + '`'},
				{name: 'Негативные промты', value: '`' + negativePrompts + '`'},
				{name: 'Кол-во шагов (steps)', value: '`' + steps + '`'}
			)
			.setFooter({text: 'Сейчас выбрана модель ' + sdModelsNames[sdModelsNames.length - 1] + '. Вы можете выбрать другую, но это займёт время'})	
		const selectList = new Discord.StringSelectMenuBuilder()
			.setCustomId(msg.author.id + "_0_" + this.name + "_m")
			.setPlaceholder('Модель')
		await sdModels.forEach(model => {
			selectList.addOptions({
				label: model.model_name,
				value: model.title
			});
		});
		const startButt = new Discord.ButtonBuilder()
			.setCustomId(msg.author.id + "_0_" + this.name + "_t")
			.setLabel('Начать')
			.setStyle(Discord.ButtonStyle.Success)
			.setDisabled(false)
		const interruptButt = new Discord.ButtonBuilder()
			.setCustomId(msg.author.id + "_0_" + this.name + "_i")
			.setLabel('Прервать')
			.setStyle(Discord.ButtonStyle.Secondary)
			.setDisabled(true)

		const listRow = new Discord.ActionRowBuilder().addComponents(selectList);
		const buttonsRow = new Discord.ActionRowBuilder().addComponents(startButt, interruptButt);
		await waitmsg.edit({ embeds: [embed], components: [listRow, buttonsRow] }); // запоминаем сообщение
		return;
	}
	async interaction(nek, client, interaction){
		const customId = interaction.customId.split("_")
		if (customId[3] === "i"){ // interrupt
			await interaction.deferUpdate();
			await interruptTask(nek, client, interaction);
			return;
		}
		if (customId[3] === "m"){ // model
			await interaction.deferUpdate();
			await changeModel(nek, client, interaction);
			return;
		}
		if (customId[3] === "p"){ // picture
			await interaction.deferUpdate();
			await img2img(nek, client, interaction);
			return;
		}
		if (customId[3] === "t"){ // text
			await interaction.deferUpdate();
			await txt2img(nek, client, interaction);
			return;
		}
		return;
    }
}

module.exports = Neuro;

