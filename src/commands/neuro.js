const Discord = require("discord.js");
const http = require("http");

const PChostname = "192.168.10.67";
const PCport = "7861";
const defaultSettings = {
	batch: 1,
	steps: 20,
	sampler: "Euler a",
	cfgScale: 7,
	seed: -1,
	width: 512,
	height: 512,
	denoising: 0.7,
	clipSkip: 2
}

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
let api = {};
api.postInterrupt = async () => {
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/interrupt',
		method: 'POST',
		headers: {'accept': 'application/json'}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
		const req = http.request(options, (res) => { // обращаемся к серваку
			res.on('end', () => {
				resolve(true);
			});
		});
		req.on('error', (e) => {
			console.error(e);
			resolve(false);
		});
		req.end();
	})
}
api.postInterrogate = async () => {
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/interrogate',
		method: 'POST',
		headers: {'accept': 'application/json', 'Content-Type': 'application/json'}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
		const req = http.request(options, (res) => { // обращаемся к серваку
			res.on('end', () => {
				resolve(true);
			});
		});
		req.on('error', (e) => {
			console.error(e);
			resolve(false);
		});
		req.end();
	})
}
api.postSkip = async () => {
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/interrupt',
		method: 'POST',
		headers: {'accept': 'application/json'}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
		const req = http.request(options, (res) => { // обращаемся к серваку
			res.on('end', () => {
				resolve(true);
			});
		});
		req.on('error', (e) => {
			console.error(e);
			resolve(false);
		});
		req.end();
	})
}
api.postOptions = async (optionsObject = {}) => {
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/options',
		method: 'POST',
		headers: {'accept': 'application/json', 'Content-Type': 'application/json'}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
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
			console.error(e);
			resolve(false);
		});
		req.write(optionsObject); // пишем данные в сайт
		req.end();
	})
	
}
api.getOptions = async () => {
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/options',
		method: 'GET',
		headers: {'accept': 'application/json'}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
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
			console.error(e);
			resolve(false);
		});
		req.end();
	})
}
api.getProgress = async (skip_current_image=false) => {
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/progress?skip_current_image=' + skip_current_image,
		method: 'GET',
		headers: {'accept': 'application/json'}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
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
			console.error(e)
			resolve(false);
		});
		req.end();
	})
}
api.getMemory = async () => {
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/memory',
		method: 'GET',
		headers: {'accept': 'application/json'}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
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
			console.error(e);
			resolve(false);
		});
		req.end();
	})
}
api.getSdModels = async () => {
	const options = { // параметры обращения к серваку
		hostname: PChostname,
		port: PCport,
		path: '/sdapi/v1/sd-models',
		method: 'GET',
		headers: {'accept': 'application/json'}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
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
			console.error(e);
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
	//let negativePrompts = oldEmbed.fields[1].value.replace(/`/g, '');
	//if (!negativePrompts) 
	let negativePrompts = "mutation, watermark, bad hands, bad fingers, bad anatomy, crooked fingers, crooked hands, ugly hands, ugly fingers, twisted fingers, non-anatomical fingers";
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
	imgResult.info = JSON.parse(imgResult.info)
	//console.log(imgResult)
	const imgBuffer = new Buffer.from(imgResult.images[0], "base64");
	embed = new Discord.EmbedBuilder()
		.setTitle('Готово')
		.setColor(nek.config.basecolor)
		.setDescription("Ваша кака, сэр")
		.setImage('attachment://' + imgResult.info.seed + '.png');
	await interaction.message.edit({ embeds: [embed], files: [{attachment: imgBuffer, name: imgResult.info.seed + ".png"}], components: [] })
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
		"-[stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) - API, с помощью которого можно через бота опросить комп\n";
        this.name = "neuro";
    }

    async run(nek, client, msg, args){
		let embed;
		if (workingNow.id) {
			embed = new Discord.EmbedBuilder()
				.setTitle("Подождите")
				.setColor(nek.config.errorcolor)
				.setDescription("Кто-то уже использует команду. Подождите несколько минут и попробуйте снова");
			await msg.reply({ embeds: [embed] }); // запоминаем сообщение
			return;
		}
		args.shift();
		let uo = {}; // user options, пользовательские параметры
		uo.seed = Number(args[0])
		// вот тут надо обработать кучу аргументов
		if (!args[0]) {
			embed = new Discord.EmbedBuilder()
				.setTitle('Соединение установлено, но делать нечего')
				.setColor(nek.config.errorcolor)
				.setDescription("Вы не указали промты ([Что это?](https://strikingloo.github.io/stable-diffusion-vs-dalle-2)). Пока что \"интерактивное заполнение аргументов\" не реализовано.\n"+
				"Попробуйте `" + nek.config.prefix + this.name + " puppy dog, gray hair` например.");
			await msg.reply({ embeds: [embed] }); // запоминаем сообщение
			return;
		}
		
		embed = new Discord.EmbedBuilder()
			.setTitle("Подключение")
			.setColor(nek.config.basecolor)
			.setDescription("Подключение к серверу...");
		const waitmsg = await msg.reply({ embeds: [embed] }); // запоминаем сообщение
		
		const options = await api.getOptions();
		if (!options) {
			embed = new Discord.EmbedBuilder()
				.setTitle("Ошибка")
				.setColor(nek.config.errorcolor)
				.setDescription("Хост не отвечает. Попробуйте позже");
			await waitmsg.edit({ embeds: [embed] }); // запоминаем сообщение
			return;
		}
		
		// задаем настроки
		// если значение не указано ранее, то заменяем их на стандартные
		uo.steps = 		uo.steps || defaultSettings.steps;
		uo.sampler = 	uo.sampler || defaultSettings.sampler;
		uo.cfgScale = 	uo.cfgScale || defaultSettings.cfgScale;
		
		uo.width = 		uo.width || defaultSettings.width;
		uo.height = 	uo.height || defaultSettings.height;
		
		uo.seed = 		uo.seed || defaultSettings.seed;
		uo.denoising = 	uo.denoising || defaultSettings.denoising;
		uo.clipSkip = 	uo.clipSkip || defaultSettings.clipSkip;
		
		const positivePrompts = 'pos';
		const negativePrompts = 'neg';
		embed = new Discord.EmbedBuilder()
			.setTitle('Текущие настройки:')
			.setColor(nek.config.basecolor)
			//.setDescription("Текущие настройки:")
			.addFields(
				{name: 'Модель', value: '`' + options.sd_model_checkpoint + '`'},
				{name: 'Положительные промпты', value: '`' + positivePrompts + '`'},
				{name: 'Негативные промпты', value: '`' + negativePrompts + '`'},
				{name: 'Настройки', value: '```\n' + 
				'Steps: ' + uo.steps + '\n' +
				'Sampler: ' + uo.sampler + '\n' +
				'CFG scale: ' + uo.cfgScale + '\n' +
				'Seed: ' + uo.seed + ' ' + (uo.seed === -1 ? '(random)' : '') + '\n' +
				'Size: ' + uo.width + 'x' + uo.height + '\n' +
				'Denoising: ' + uo.denoising + '\n' +
				'Clip skip: ' + uo.clipSkip + '\n' +
				'\n```'},
				//{name: 'Сессия', value: '`' + waitmsg.id + '`'}
			)
		// const selectList = new Discord.StringSelectMenuBuilder()
			// .setCustomId(msg.author.id + "_0_" + this.name + "_m")
			// .setPlaceholder('Модель')
		// await sdModels.forEach(model => {
			// selectList.addOptions({
				// label: model.model_name,
				// value: model.title
			// });
		// });
		const startB = new Discord.ButtonBuilder()
			.setCustomId(msg.author.id + "_0_" + this.name + "_t")
			.setLabel('Генерировать')
			.setStyle(Discord.ButtonStyle.Success)
			.setDisabled(false)
			//.setEmoji(':vibration_mode:');
		const changePromptB = new Discord.ButtonBuilder()
			.setCustomId(msg.author.id + "_0_" + this.name + "_cp")
			.setLabel('Изменить промпты')
			.setStyle(Discord.ButtonStyle.Secondary)
			.setDisabled(false)
			//.setEmoji(':gear:');
		const changeSettingsB = new Discord.ButtonBuilder()
			.setCustomId(msg.author.id + "_0_" + this.name + "_cs")
			.setLabel('Изменить настройки')
			.setStyle(Discord.ButtonStyle.Secondary)
			.setDisabled(false)
			//.setEmoji(':gear:');

		//const listRow = new Discord.ActionRowBuilder().addComponents(selectList);
		const buttonsRow = new Discord.ActionRowBuilder().addComponents(startB, changePromptB, changeSettingsB);
		await waitmsg.edit({ embeds: [embed], components: [buttonsRow] }); // запоминаем сообщение
		return;
	}
	
	
	
	
	async interaction(nek, client, interaction){
		const customId = interaction.customId.split("_");
		await interaction.deferUpdate();
		switch(customId[3]) {
			case 'i':
				await api.interrupt();
				break;
			case 's':
				await api.skip();
				break;
			case 'cp':
				await changePrompt(nek, client, interaction);
				break;
			case 'cs':
				await changeSettings(nek, client, interaction);
				break;
			case 'm':
				await changeModel(nek, client, interaction);
				break;
			case 'p':
				await img2img(nek, client, interaction);
				break;
			case 't':
				await txt2img(nek, client, interaction);
				break;
		}
		nek.log(this.name, 'unknown operation', 'red');
		return;
    }
}

module.exports = Neuro;

