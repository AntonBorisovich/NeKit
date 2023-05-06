const Discord = require("discord.js");
const https = require("https");
const StaticMaps = require('staticmaps');
const numco = require("numco");


// Всякие функции обращения к сайту
const createPayload = (values) => { // создать сайту отформатированный запрос. На вход объект с параметром (например {skip: 0, take: 20})
	// генерируем разделятор
	let webkit = '----WebKitFormBoundary';
	for (let i = 0; i < 16; i++) {
		webkit += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62)); // берём рандом символ и пихаем
	}

	// делаем тело
	let outputBody = ""; // duh
	for (var [key, value] of Object.entries(values)) { // перебераем объект с данными
		outputBody += "--" + webkit + "\r\n"; // пишем разделятор
		outputBody += "Content-Disposition: form-data; name=\"" + key + "\"\r\n"; // пишем тип данных и их название, скип строки
		outputBody += "\r\n"; // скипаем строку потому что bruh
		outputBody += value + "\r\n"; // пишем значение и скипаем строку
	}
	outputBody += "--" + webkit + "--"; // пишем финальный разделятор
	const encoder = new TextEncoder();  // создаем энкодер, что бы сайт понял русские символы
	return {boundary: webkit, body: encoder.encode(outputBody)}; // возвращаем разделятор и энкодированные параметры
}
const searchRoute = async (name, type, skip = 0) => { // найти маршрут по номеру маршрута
	let payload;
	if (type) { // если дан тип транспорта
		payload = createPayload({skip: skip, take: 20, transportTypes: type, routeShortName: name}); // генерируем payload
	} else {
		payload = createPayload({skip: skip, take: 20, routeShortName: name}); // генерируем payload
	}
	//console.log(payload.body)
	const options = { // параметры обращения к серваку
	  hostname: 'nts-admin.orgp.spb.ru',
	  port: 443,
	  path: '/api/visary/operator/route',
	  method: 'POST',
	  headers: {
		"content-type": "multipart/form-data; boundary=" + payload.boundary,
		'Content-Length': payload.body.length
	  }
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
		const req = https.request(options, (res) => { // обращаемся к серваку
			let data = "";
			res.on('data', (d) => {
				//console.log('got data');
				data = data + d;
			});
			res.on('end', () => {
				//console.log(data);
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
			reject(e);
		});
		req.write(payload.body); // пишем данные в сайт
		req.end();
	})
}
const getTransport = async (type, bbox) => {
	let transport = ''
	if (type) {
		transport = 'transport=' + type + '&';
	}
	const options = { // параметры обращения к серваку
	  hostname: 'nts-admin.orgp.spb.ru',
	  port: 443,
	  path: '/api/visary/geometry/vehicle?' + transport + 'bbox=' + bbox,
	  method: 'GET',
	  headers: {}
	}
	return new Promise((resolve, reject) => { // ждем пока получим ответ от сайта
		const req = https.request(options, (res) => { // обращаемся к серваку
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
			reject(e);
		});
		req.end();
	})
}

// Функции обработки interaction-ов
const pageGeo = async (nek, client, interaction) => {
	console.log(interaction.values)
	// получаем 
	const valueArgs = interaction.values[0].split("_"); // разделяем value по подстрочникам
	
	embed = new Discord.EmbedBuilder()
		.setTitle('Геолокация')
		.setColor(nek.config.basecolor)
		.setDescription("Страница с картой")
	await interaction.message.edit({ embeds: [embed] });
	console.log(valueArgs)
	
	
	return;
	
	let directionRounded = Math.ceil(car.Direction / 15) * 15; // округляем градусы по 15
	if (directionRounded === 360) directionRounded = 0;
	
	const markerPath = "./src/assets/orgp/marker_" + directionRounded + ".png";
	
	const vehicleIconPath = "./src/assets/orgp/" + car.TransportType + ".png";

	const map = new StaticMaps({
		width: 512,
		height: 512,
		tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
	});
	
	const markerparam = {
	  img: markerPath,
	  offsetX: 32,
	  offsetY: 32,
	  width: 64,
	  height: 64,
	  coord : [car.Location.Longitude, car.Location.Latitude]
	};
	map.addMarker(markerparam); // рисуем стрелочку
	const iconparam = {
	  img: vehicleIconPath,
	  offsetX: 32,
	  offsetY: 32,
	  width: 64,
	  height: 64,
	  coord : [car.Location.Longitude, car.Location.Latitude]
	};
	map.addMarker(iconparam); // рисуем иконку
	
	await map.render([car.Location.Longitude, car.Location.Latitude], 15); // рендерим карту
	const mappic = await map.image.buffer('image/png'); // сохраняем в буфер
	const unixTime = Math.floor(Date.now() / 1000);
	embed = new Discord.EmbedBuilder()
		.setTitle('Эксперемексы')
		.setColor(nek.config.basecolor)
		.setDescription("Карта для " + car.VehicleLabel + " на <t:" + unixTime +":f>")
		.setImage('attachment://' + car.VehicleLabel + '.png')
		.setFooter({text: 'Нет. Пока нельзя выбрать для какой именно машины отобразить карту. Ждите обновы'})
	const fileWithName = new Discord.AttachmentBuilder(mappic, { name: car.VehicleLabel + '.png' });
	await interaction.message.edit({files: [fileWithName], embeds: [embed]}); // отправляем
	return;		
}
const pagePhoto = async (nek, client, interaction) => {
	const customId = interaction.customId.split("_"); // разделяем value по подстрочникам
	const valueArgs = interaction.values[0].split("_"); // разделяем value по подстрочникам
	
	const embed = new Discord.EmbedBuilder()
		.setTitle('Фото ')
		.setColor(nek.config.basecolor)
		.setDescription("Страница с фоткой")
		
	const unzipedLabels = numco.decompress(customId[5]); // сжимаем бортовые номера
	const selectList = new Discord.StringSelectMenuBuilder()
			.setCustomId(customId.splice(-1, 1) + "_lp")
			.setPlaceholder('Получить больше инфы о...')
		
	await unzipedLabels.forEach((label) => {
		selectList.addOptions({
			label: String(label).substring(1),
			value: String(label).substring(1)
		});
	});
	
	const photo = new Discord.ButtonBuilder()
		.setCustomId(customId.splice(-1, 1) + "_bp")
		.setLabel('Фото')
		.setStyle(Discord.ButtonStyle.Primary)
		.setDisabled(true)
	const geo = new Discord.ButtonBuilder()
		.setCustomId(customId.splice(-1, 1) + "_bg")
		.setLabel('Местоположение')
		.setStyle(Discord.ButtonStyle.Secondary)
		.setDisabled(false)
	const update = new Discord.ButtonBuilder()
		.setCustomId(customId.splice(-1, 1) + "_bu")
		.setLabel('Обновить')
		.setStyle(Discord.ButtonStyle.Secondary)
		.setDisabled(true)
	
	// создаем строки интерактивных элементов
	const listRow = new Discord.ActionRowBuilder().addComponents(selectList);
	const buttonsRow = new Discord.ActionRowBuilder().addComponents(photo, geo, update);

	await interaction.message.edit({ embeds: [embed], components: [listRow, buttonsRow] });
	
	return;
}

const argsGUI = async (nek, msg, args) => {
	let embed
	
	let byLabel = new Discord.ButtonBuilder()
		.setCustomId("byLabel")
		.setLabel('По борт. номеру')
		.setStyle(Discord.ButtonStyle.Primary)
		.setDisabled(false)
	let byRoute = new Discord.ButtonBuilder()
		.setCustomId("byRoute")
		.setLabel('По номеру маршрута')
		.setStyle(Discord.ButtonStyle.Primary)
		.setDisabled(false)
	let searchRoute = new Discord.ButtonBuilder()
		.setCustomId("searchRoute")
		.setLabel('Найти маршрут')
		.setStyle(Discord.ButtonStyle.Secondary)
		.setDisabled(false)
	const rowBefore = new Discord.ActionRowBuilder().addComponents(byLabel, byRoute, searchRoute);
		
	let byLabelOff = new Discord.ButtonBuilder()
		.setCustomId("byLabel")
		.setLabel('По борт. номеру')
		.setStyle(Discord.ButtonStyle.Primary)
		.setDisabled(true)
	let byRouteOff = new Discord.ButtonBuilder()
		.setCustomId("byRoute")
		.setLabel('По номеру маршрута')
		.setStyle(Discord.ButtonStyle.Primary)
		.setDisabled(true)
	let searchRouteOff = new Discord.ButtonBuilder()
		.setCustomId("searchRoute")
		.setLabel('Найти маршрут')
		.setStyle(Discord.ButtonStyle.Secondary)
		.setDisabled(true)
	const rowAfter = new Discord.ActionRowBuilder().addComponents(byLabelOff, byRouteOff, searchRouteOff);
	
	embed = new Discord.EmbedBuilder()
		.setTitle('Поиск транспорта в Санкт-Петербурге')
		.setColor(nek.config.basecolor)
		.setDescription('Вы можете найти транспорт по бортовому/парковому номеру, по номеру маршрута. Вы можете найти номер маршрута, если не уверены, что он существует')
		.setFooter({text: 'Если вы не хотите каждый раз нажимать кнопки и заполнять форму, то используйте аргументы (' + nek.config.prefix + 'help orgp --help)'})
	// создаем строки интерактивных элементов
	const response = await msg.reply({
		embeds: [embed],
		components: [rowBefore]
	});
	
	const collectorFilter = i => i.user.id === msg.author.id;
	try {
		const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
		let orgpArgs = {};
		orgpArgs.workMode = confirmation.customId;
		orgpArgs.transType = false;
		orgpArgs.arbArg = false;
		
			
		if (confirmation.customId === 'byLabel') {
			const modal = new Discord.ModalBuilder()
				.setCustomId('byLabel')
				.setTitle('Поиск по бортовому/парковому номеру');
			const labelInput = new Discord.TextInputBuilder()
				.setCustomId('labelNum')
				.setLabel("Бортовой номер")
				.setPlaceholder('например 5051')
				.setStyle(Discord.TextInputStyle.Short)
				.setRequired(true);
			const typeInput = new Discord.TextInputBuilder()
				.setCustomId('type')
				.setLabel("Тип транспорта")
				.setPlaceholder('троллейбус (тро...), автобус (ав...), трамвай (тра...)')
				.setStyle(Discord.TextInputStyle.Short)
				.setRequired(false);
			const row1 = new Discord.ActionRowBuilder().addComponents(labelInput);
			const row2 = new Discord.ActionRowBuilder().addComponents(typeInput);
			
			modal.addComponents(row1, row2);
			modalResponse = await confirmation.showModal(modal);
			try {
				const modalConfirmation = await confirmation.awaitModalSubmit({ filter: collectorFilter, time: 60000 });
				
				orgpArgs.arbArg = modalConfirmation.fields.getTextInputValue('labelNum');
				orgpArgs.transType = modalConfirmation.fields.getTextInputValue('type');
				await modalConfirmation.deferUpdate();
				await response.delete();
				return orgpArgs;
			} catch (e) {
				embed.setFooter({text: 'Вы не заполнили форму в течение минуты. Запрос отменён'})
				await response.edit({
					embeds: [embed],
					components: [rowAfter]
				});
				return 'timeout';
			}
			
			
		} else if (confirmation.customId === 'byRoute') {
			const modal = new Discord.ModalBuilder()
				.setCustomId('byRoute')
				.setTitle('Поиск по номеру маршрута');
			const routeInput = new Discord.TextInputBuilder()
				.setCustomId('routeNum')
				.setLabel("Номер маршрута")
				.setPlaceholder('например 37')
				.setStyle(Discord.TextInputStyle.Short)
				.setRequired(true);
			const typeInput = new Discord.TextInputBuilder()
				.setCustomId('type')
				.setLabel("Тип транспорта")
				.setPlaceholder('троллейбус (тро...), автобус (ав...), трамвай (тра...)')
				.setStyle(Discord.TextInputStyle.Short)
				.setRequired(false);
			const row1 = new Discord.ActionRowBuilder().addComponents(routeInput);
			const row2 = new Discord.ActionRowBuilder().addComponents(typeInput);
			
			modal.addComponents(row1, row2);
			modalResponse = await confirmation.showModal(modal);
			try {
				const modalConfirmation = await confirmation.awaitModalSubmit({ filter: collectorFilter, time: 60000 });
				
				orgpArgs.arbArg = modalConfirmation.fields.getTextInputValue('routeNum');
				orgpArgs.transType = modalConfirmation.fields.getTextInputValue('type');
				await modalConfirmation.deferUpdate();
				await response.delete();
				return orgpArgs;
			} catch (e) {
				embed.setFooter({text: 'Вы не заполнили форму в течение минуты. Запрос отменён'})
				await response.edit({
					embeds: [embed],
					components: [rowAfter]
				});
				return 'timeout';
			}
			
		} else if (confirmation.customId === 'searchRoute') {
			const modal = new Discord.ModalBuilder()
				.setCustomId('searchRoute')
				.setTitle('Поиск маршрута');
			const routeInput = new Discord.TextInputBuilder()
				.setCustomId('routeNum')
				.setLabel("Номер маршрута")
				.setPlaceholder('например 2')
				.setStyle(Discord.TextInputStyle.Short)
				.setRequired(true);
			const typeInput = new Discord.TextInputBuilder()
				.setCustomId('type')
				.setLabel("Тип транспорта")
				.setPlaceholder('троллейбус (тро...), автобус (ав...), трамвай (тра...)')
				.setStyle(Discord.TextInputStyle.Short)
				.setRequired(false);
				
			const row1 = new Discord.ActionRowBuilder().addComponents(routeInput);
			const row2 = new Discord.ActionRowBuilder().addComponents(typeInput);

			modal.addComponents(row1, row2);
			modalResponse = await confirmation.showModal(modal);
			try {
				const modalConfirmation = await confirmation.awaitModalSubmit({ filter: collectorFilter, time: 60000 });
				
				orgpArgs.arbArg = modalConfirmation.fields.getTextInputValue('routeNum');
				orgpArgs.transType = modalConfirmation.fields.getTextInputValue('type');
				await modalConfirmation.deferUpdate();
				await response.delete();
				return orgpArgs;
			} catch (e) {
				embed.setFooter({text: 'Вы не заполнили форму в течение минуты. Запрос отменён'})
				await response.edit({
					embeds: [embed],
					components: [rowAfter]
				});
				return 'timeout';
			}
		}
	} catch (e) {
		embed.setFooter({text: 'Вы не нажали на кнопку в течении минуты. Запрос отменён'})
		await response.edit({
			embeds: [embed],
			components: [rowAfter]
		});
		return 'timeout';
	}
}


const fullbbox = "31.262970,60.444011,28.473816,59.451358"; // https://i.imgur.com/l6al1YY.png

const partbboxes = [ // https://i.imgur.com/ljnXWyw.png
"31.262970,60.444011,28.473816,60.077345", // top
"31.262970,60.077345,28.473816,59.983189", // upcity
"31.262970,59.983189,28.473816,59.905812", // midcity
"31.262970,59.905812,28.473816,59.830670", // downcity
"31.262970,59.830670,28.473816,59.451358"] // bottom

// для нормального отображения типа транспорта
const readableType = {
	'trolley': 'троллейбус',
	'bus': 'автобус',
	'tram': 'трамвай'
}
const toShortType = {
	'trolley': 0,
	'bus': 1,
	'tram': 2
}
const fromShortType = [
	'trolley',
	'bus',
	'tram'
]

const dirToBlock = ["🟦", "🟧"];

const funnyLoadingStrings = [
	// Основной
	"Получение данных...",
	
	// Внятно
	"Подождите...",
	"Загрузка...",
	"Загружаем...",
	"Подключение...",
	"Подключаюсь...",
	"Подключение к серверу...",
	"Запускаем...",
	"Запускаюсь...",
	
	// Слишком официально
	"Подождите, операция выполняется...",
	"Ожидайте...",
	"Сейчас, погодите...",
	"Один момент...",
	"Минутку...",
	"Loading...",
	
	// bruh, но хотя бы понятно, что идёт загрузка
	"Втыкаем...",
	"агде? А, ща...",
	"Есть ли у пингвинов колени... хм. А, ну да, питер. Ща...",
	"Ошибка подключения. шутка, ща...",
	"Ща зайду, посмотрю, че там плавает в питере...",
	"Внимание! Для работы команды нужно заплатить 9.99$. Ха, нет. Просто подожди ещё немного...",
	
	// mega bruh
	"Сэр, прошу Вас, не бейте мою грудную клетку арматурой 🤓",
	"Вау. Оно работает",
	"В питере пить... В питере пить...",
	"Нисикс - пипа",
	"Их слишком много~",
	"Когда московско-питерская ветка метро?"
];

class Orgp {
	constructor(nek){
		this.category = "transport";
		
		this.perms = ["EMBED_LINKS", "ATTACH_FILES"];
        this.name = "orgp"; // имя команды
		this.desc = "питерский транспорт"; // описание команды в общем списке команд
		this.advdesc = "Берёт информацию о маршрутах в Санкт-Петербурге с [сайта \"Портал Общественного Транспорта Санкт-Петербурга\"](https://transport.orgp.spb.ru/).\nФото и данные о машинах предоставляются сайтом [transphoto.org](https://transphoto.org).\n\nСделано специально для <@374144960221413386>"; // описание команды в помоще по конкретной команде
		this.args = "<операция> <тип> <номер>"; // аргументы в общем списке команд
		this.argsdesc =
		"<операция> - `route`/`маршрут` (поиск машин на данном вами маршруте), `search`/`поиск` (поиск маршрута, если забыли), `label`/`номер` (поиск машины по номеру)\n" +
		"<тип> - троллейбус (тро...), автобус (ав...), трамвай (тра...)\n" +
		"<номер> - номер маршрута"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<операция> <тип> <номер>"; // аргументы в помоще по конкретной команде
    };
	
	

    async run(nek, client, msg, args){
		args.shift(); // режем первый аргумент т.к. это название команды
		let orgpArgs = {};
		if (!args[0]) { // если не был дан никакой аргумент
			orgpArgs = await argsGUI(nek, msg, args); // ждем, пока мы получим ответ от интерактивного заполнения
			if (!orgpArgs) {
				let embed = new Discord.EmbedBuilder()
					.setTitle('Ошибка')
					.setColor(nek.config.errorcolor)
					.setDescription("Произошла ошибка 0xc000007b")
				await msg.reply({ embeds: [embed] }); // запоминаем сообщение
				return;
			}
			if (orgpArgs === "timeout") return;
			if (orgpArgs.transType.toLowerCase().startsWith('тро') || orgpArgs.transType.toLowerCase().startsWith('nhj')) { // троллейбус
				orgpArgs.transType = "trolley";
			} else if (orgpArgs.transType.toLowerCase().startsWith('ав') || orgpArgs.transType.toLowerCase().startsWith('fd')) { // автобус
				orgpArgs.transType = "bus";
			} else if (orgpArgs.transType.toLowerCase().startsWith('тра') || orgpArgs.transType.toLowerCase().startsWith('nhf')) { // трамвай
				orgpArgs.transType = "tram";
			} else {
				orgpArgs.transType = false;
			}
			console.log(orgpArgs);
		} else {
			// традиционная обработка аргументов
			orgpArgs.transType = false;
			orgpArgs.workMode = false;
			orgpArgs.arbArg = false;
			
			for await (const arg of args) {
				// тип транспорта (transport type)
				if (arg.toLowerCase().startsWith('тро') || arg.toLowerCase().startsWith('nhj')) { // троллейбус
					orgpArgs.transType = "trolley";
				} else if (arg.toLowerCase().startsWith('ав') || arg.toLowerCase().startsWith('fd')) { // автобус
					orgpArgs.transType = "bus";
				} else if (arg.toLowerCase().startsWith('тра') || arg.toLowerCase().startsWith('nhf')) { // трамвай
					orgpArgs.transType = "tram";
					
				// режим работы (work mode)
				} else if (arg.toLowerCase() === 'route' || arg.toLowerCase() === 'маршрут') {
					orgpArgs.workMode = "byRoute";
				} else if (arg.toLowerCase() === 'label' || arg.toLowerCase() === 'номер') {
					orgpArgs.workMode = "byLabel";
				} else if (arg.toLowerCase() === 'search' || arg.toLowerCase() === 'поиск') {
					orgpArgs.workMode = "searchRoute";
					
				// любой иной произвольный аргумент (arbitrary argument)
				} else {
					orgpArgs.arbArg = arg.toLowerCase();
				}
			}
		}
		
		if (orgpArgs.workMode === "byRoute") {
			await searchByRoute(orgpArgs.arbArg, orgpArgs.transType);
		} else if (orgpArgs.workMode === "byLabel") {
			await searchByLabel(orgpArgs.arbArg, orgpArgs.transType);
		} else if (orgpArgs.workMode === "searchRoute") {
			await searchRouteName(orgpArgs.arbArg, orgpArgs.transType);
		} else {
			let embed = new Discord.EmbedBuilder()
			.setTitle('А че делать то?')
			.setColor(nek.config.errorcolor)
			.setDescription('Неизвестная операция. Читайте аргументы в `' + nek.config.prefix + this.name + ' --help`')
			await msg.reply({ embeds: [embed] });
		}
		return;
		
		async function searchByRoute(routeName, transType) {
			if (!routeName) {
				let embed = new Discord.EmbedBuilder()
					.setTitle('А что искать?')
					.setColor(nek.config.errorcolor)
					.setDescription("Укажите номер маршрута")
				await msg.reply({ embeds: [embed] }); // запоминаем сообщение
				return;
			}
			if (!transType) {
				let embed = new Discord.EmbedBuilder()
					.setTitle('А что искать?')
					.setColor(nek.config.errorcolor)
					.setDescription("Укажите тип транспорта")
				await msg.reply({ embeds: [embed] }); // запоминаем сообщение
				return;
			}
			let loadingString;
			if (Math.random() > 0.5) { // вероятость 50/50
				loadingString = funnyLoadingStrings[Math.floor(Math.random() * (funnyLoadingStrings.length))]; // получаем рандомную смешнявку
			} else {
				loadingString = funnyLoadingStrings[0] // получаем нормальную строку
			}

			let embed = new Discord.EmbedBuilder()
				.setTitle('Веду поиск...')
				.setColor(nek.config.basecolor)
				.setDescription(loadingString)
			const waitmsg = await msg.reply({ embeds: [embed] }); // запоминаем сообщение
			
			let transports  = await getTransport(transType, fullbbox); // ищем по всему питеру
			if (!transports) { // если ничего не найдено (или произошла ошибка)
				let embed = new Discord.EmbedBuilder()
				.setTitle('Каво')
				.setColor(nek.config.errorcolor)
				.setDescription('Не удалось получить ответ от сайта. Попробуйте ещё раз')
				await waitmsg.edit({ embeds: [embed] });
				return;
			}
			
			let limitReached = false;
			if (transports.length === 1000) { // если мы уперлись в лимит запроса
				transports = [];
				let counter = 0;
				
				let embed = new Discord.EmbedBuilder()
				.setTitle('Веду поиск...')
				.setColor(nek.config.basecolor)
				.setDescription(loadingString + ' `' + counter + '/' + partbboxes.length + "`")
				await waitmsg.edit({ embeds: [embed] });
				
				// начинаем поиск по зонам
				for await (const bbox of partbboxes) {
					counter += 1;
					const transPart  = await getTransport(transType, bbox);
					transports = [...transports, ...transPart];
					if (transPart.length === 1000) {
						limitReached = true;
					}
					embed = new Discord.EmbedBuilder()
						.setTitle('Веду поиск...')
						.setColor(nek.config.basecolor)
						.setDescription(loadingString + ' `' + counter + '/' + partbboxes.length + "`")
					await waitmsg.edit({ embeds: [embed] });
				}
			}
			
			let routeTransports = []; // транспорты на нужном нам маршруте
			let labels = [];
			let publicOut = []; // бортовые номера
			for await (const trans of transports) { // чекаем все маршруты
				if (trans.RouteShortName.toLowerCase() === routeName) { // если это маршрут, который был указан пользователем
					routeTransports.push(trans); // записать полный объект транспорта
					labels.push(`${(trans.RouteDirection+1)}${trans.VehicleLabel}`) // записать чисто номера маршрутов (надо для создания customId кнопки)
					publicOut.push(dirToBlock[trans.RouteDirection] + " №" + trans.VehicleLabel + "\n"); // записать видимые для пользователя данные
				}
			}
			
			publicOut.sort(); // сортируем
			publicOut = publicOut.join(''); // преобразуем отсортированный массив в строку
			if (!routeTransports[0]) { // если ничего не нашли
				let embed = new Discord.EmbedBuilder()
				.setTitle('no bitches')
				.setColor(nek.config.errorcolor)
				.setDescription('Не нашел ничего')
				await waitmsg.edit({ embeds: [embed] });
				return;
			}
			
			// эмбед
			embed = new Discord.EmbedBuilder()
				.setTitle('Маршрут ' + routeTransports[0].RouteShortName)
				.setColor(nek.config.basecolor)
				.setDescription("Найдено " + routeTransports.length + " (" + readableType[transType] + "):\n" + publicOut + "\n" +
				"🟦 - туда / 🟧 - обратно\n" +
				"[:map: Карта маршрута](https://transport.orgp.spb.ru/routes/" + routeTransports[0].RouteId + ")")
			if (limitReached) {
				embed.setFooter({text: "ВНИМАНИЕ! Был достигнут лимит сайта. Имейте ввиду, что в списке присутствует не весь транспорт. Это не ваша вина, просто слишком много транспорта."});
			}
			
			// списки
			let selectList;
			const zipedLabels = numco.compress(labels); // сжимаем бортовые номера
			const preCustomId = msg.author.id + "_0_orgp_" // данные, которые должны быть в каждом customId
			console.log(preCustomId.length+3);
			if (preCustomId.length+3 > 100) {
				console.log("wtf too much shit");
				await waitmsg.edit({ embeds: [embed] });
				return;
			}
			
			if (labels.length <= 25) {
				selectList = new Discord.StringSelectMenuBuilder()
					.setCustomId(preCustomId + "_" + zipedLabels + "_lp")
					.setPlaceholder('Получить больше инфы о...')
					.setDisabled(true)
				await labels.forEach((label) => {
					selectList.addOptions({
						label: label.substring(1),
						value: label.substring(1)
					});
				});
			} else {
				selectList = new Discord.StringSelectMenuBuilder()
					.setCustomId("too much")
					.setPlaceholder('Получить больше инфы о...')
					.setDisabled(true)
				selectList.addOptions({
					label: 'too much',
					value: 'too much'
				});
			}
			
			
			// кнопки
			const photo = new Discord.ButtonBuilder()
				.setCustomId(preCustomId + "_bp")
				.setLabel('Фото')
				.setStyle(Discord.ButtonStyle.Primary)
				.setDisabled(true)
			const geo = new Discord.ButtonBuilder()
				.setCustomId(preCustomId + "_bg")
				.setLabel('Местоположение')
				.setStyle(Discord.ButtonStyle.Primary)
				.setDisabled(true)
			const update = new Discord.ButtonBuilder()
				.setCustomId(preCustomId + "_bu")
				.setLabel('Обновить')
				.setStyle(Discord.ButtonStyle.Secondary)
				.setDisabled(true)
			
			// создаем строки интерактивных элементов
			const listRow = new Discord.ActionRowBuilder().addComponents(selectList);
			const buttonsRow = new Discord.ActionRowBuilder().addComponents(photo, geo, update);
			
			await waitmsg.edit({ embeds: [embed], components: [listRow, buttonsRow] });
			
			return;
		}
		
		// Поиск по бортовому номеру
		async function searchByLabel(label, type){
			let embed = new Discord.EmbedBuilder()
				.setTitle('Поиск по бортовому номеру')
				.setColor(nek.config.basecolor)
				.setDescription('Пока что в разработке')
			await msg.reply({ embeds: [embed] }); // запоминаем сообщение
			return;
		}
		
		// Поиск маршрута
		async function searchRouteName(approxName, type){
			if (!approxName) {
				let embed = new Discord.EmbedBuilder()
					.setTitle('Маршрут не найден')
					.setColor(nek.config.errorcolor)
					.setDescription('Укажите хотя бы номер маршрута')
				await msg.reply({ embeds: [embed] }); // запоминаем сообщение
				return;
			}
			let loadingString;
			if (Math.random() > 0.5) { // вероятость 50/50
				loadingString = funnyLoadingStrings[Math.floor(Math.random() * (funnyLoadingStrings.length))]; // получаем рандомную смешнявку
			} else {
				loadingString = funnyLoadingStrings[0] // получаем нормальную строку
			}

			let embed1 = new Discord.EmbedBuilder()
				.setTitle('Веду поиск...')
				.setColor(nek.config.basecolor)
				.setDescription(loadingString)
			const waitmsg = await msg.reply({ embeds: [embed1] }); // запоминаем сообщение
			
			let searchResults = await searchRoute(approxName, type, 0);
			if (!searchResults || !searchResults[0]) {
				let embed = new Discord.EmbedBuilder()
					.setTitle('Маршрут не найден')
					.setColor(nek.config.errorcolor)
					.setDescription('Не найдено ни одного маршрута с похожим номером')
				await waitmsg.edit({ embeds: [embed] }); // запоминаем сообщение
				return;
			}
			
			let totalFound = searchResults.length;
			if (searchResults.length === 20) {
				let embed1 = new Discord.EmbedBuilder()
					.setTitle('Веду поиск...')
					.setColor(nek.config.basecolor)
					.setDescription(loadingString + " `Ещё немного...`")
				await waitmsg.edit({ embeds: [embed1] }); // запоминаем сообщение
				const anotherSearchResults = await searchRoute(approxName, type, 20) // пропускаем первые 20 маршрутов, т.к. мы их нашли выше, и ищем ещё
				searchResults = [...searchResults, ...anotherSearchResults]
				if (searchResults.length === 40) {
					totalFound = "40 или более";
				} else {
					totalFound = searchResults.length;
				}
			}
			let routesList = "```\n";
			for await (const route of searchResults) {
				routesList += route.ShortName + " - " + readableType[route.TransportType] + "\n";
			}
			routesList += "```";
			if (!type) {
				type = "любой";
			} else {
				type = readableType[type];
			}
			let embed = new Discord.EmbedBuilder()
				.setTitle('Поиск маршрута')
				.setColor(nek.config.basecolor)
				.setDescription("По запросу `" + approxName + "` среди типа `" + type + "` было найдено `" + totalFound + "` маршрутов:\n" + routesList +
				'\nСоветуем для поиска всё таки воспользоватся [официальным сайтом](https://transport.orgp.spb.ru/routes)')
			waitmsg.edit({ embeds: [embed] });
			return;
		}
	}
	
	async interaction(nek, client, interaction){
		
		const customId = interaction.customId.split("_")
		console.log(customId)
		if (customId[3].substring(1) === "g"){ // geo
			await interaction.deferUpdate();
			await pageGeo(nek, client, interaction);
			return;
		}
		if (customId[3].substring(1) === "p"){ // photo
			await interaction.deferUpdate();
			await pagePhoto(nek, client, interaction);
			return;
		}
		await interaction.reply({content: 'чето не то'});
		return;
	}
};

module.exports = Orgp;

