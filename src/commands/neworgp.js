// == TODO
// - Доделать страницу с фото (взять хотя бы плейсхолдер из команды stts)
// - Сделать более универсальное изменение содержимого отправленных кнопок (это активно используется в интеракциях)
// - Дать пользователю выбор отображать сторонний транспорт или нет (второй список список: только выбранный, на том же маршруте, все <тип транспорта>)
// - Дать пользователю выбор степени зума (ещё одинм рядом кнопок ниже)

// == Библиотеки
const Discord = require("discord.js");
const https = require("https");
const StaticMaps = require('staticmaps');

// == Переменные
let requests = new Map(); // карта, где хранятся запросы (типо по ключу (id сообщения) можно получить объект {msg: msg, info: {всякая инфа})

// == Константы
// координаты (bbox), в пределах которых нужно искать машины
const fullbbox = "31.262970,60.444011,28.473816,59.451358"; // https://i.imgur.com/l6al1YY.png
const partbboxes = [ // https://i.imgur.com/ljnXWyw.png
"31.262970,60.444011,28.473816,60.077345", // top
"31.262970,60.077345,28.473816,59.983189", // upcity
"31.262970,59.983189,28.473816,59.905812", // midcity
"31.262970,59.905812,28.473816,59.830670", // downcity
"31.262970,59.830670,28.473816,59.451358"] // bottom

const readableType = { // форматирование в читабельный вид типов транспорта
	'trolley': 'троллейбус',
	'bus': 'автобус',
	'tram': 'трамвай'
}
const pluralReadableType = { // форматирование в читабельный вид типов транспорта (во множественном числе)
	'trolley': 'троллейбусы',
	'bus': 'автобусы',
	'tram': 'трамваи'
}
const dirToBlock = ["🟦", "🟧"]; // а это вообще надо?

// == Основной код. Обработка запроса пользователя и установка информации о команде
class NewOrgp {
	constructor(nek){
		this.category = "transport";
		
		this.perms = ["EMBED_LINKS", "ATTACH_FILES"];
        this.name = "neworgp"; // имя команды
		this.desc = "питерский наземный транспорт"; // описание команды в общем списке команд
		this.advdesc = "Берёт информацию о маршрутах в Санкт-Петербурге с [сайта \"Портал Общественного Транспорта Санкт-Петербурга\"](https://transport.orgp.spb.ru/).\n" +
			"Фото и данные о троллейбусах и трамваях предоставляются сайтом [transphoto.org](https://transphoto.org).\n" +
			"Фото и данные об автобусах предоставляются сайтом [fotobus.msk.ru](https://fotobus.msk.ru/).\n\n" +
			"Сделано по заказу <@374144960221413386>"; // описание команды в помоще по конкретной команде
		this.args = "<операция> <тип> <номер>"; // аргументы в общем списке команд
		this.argsdesc =
		"`<операция>` - маршрут (м...) [поиск машин на данном вами маршруте], поиск (п...) [поиск маршрута, если забыли], номер (н...) [поиск машины по номеру]\n" +
		"`<тип>` - троллейбус (тро...), автобус (ав...), трамвай (тра...)\n" +
		"`<номер>` - номер маршрута"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<операция> <тип> <номер>"; // аргументы в помоще по конкретной команде
    };
    async run(nek, client, msg, args){
		args.shift(); // режем первый аргумент т.к. это название команды
		let orgpArgs = {}; // делаем пустой объект с аргументами
		if (!args[0]) { // если не был дан никакой аргумент, то запросить их
			args = await argsProcess.gui(nek, msg, args); // ждем готовых аргументов
			if (!args) return;
		}
		orgpArgs = await argsProcess.cli(args); // ждем готовых аргументов (через текстовые аргументы)
		if (orgpArgs.workMode === "byRoute") {
			await msgProcess.searchByRoute(nek, msg, orgpArgs.arbArg, orgpArgs.transType);
		} else if (orgpArgs.workMode === "byLabel") {
			await msgProcess.searchByLabel(nek, msg, orgpArgs.arbArg, orgpArgs.transType);
		} else if (orgpArgs.workMode === "searchRoute") {
			await msgProcess.searchRouteName(nek, msg, orgpArgs.arbArg, orgpArgs.transType);
		} else {
			let embed = new Discord.EmbedBuilder()
			.setTitle('Неизвестная операция')
			.setColor(nek.config.errorcolor)
			.setDescription('Неизвестная операция. Прочитайте аргументы в `' + nek.config.prefix + this.name + ' --help`')
			await msg.reply({ embeds: [embed] });
		}
		return;
	}
	
	async interaction(nek, client, interaction){
		const customId = interaction.customId.split("_");
		if (customId[4].substring(1) === "m"){ // map (кнопки "Местоположение" и "Обновить")
			await interaction.deferUpdate();
			await interactionProcess.pageMap(nek, client, interaction);
			return;
		}
		if (customId[4].substring(1) === "p"){ // photo (кнопка "Фото")
			await interaction.deferUpdate();
			await interactionProcess.pagePhoto(nek, client, interaction);
			return;
		}
		await interaction.reply({content: 'чето не то'});
		return;
	}
};

// == Обработка аргументов
let argsProcess = {};
argsProcess.gui = async (nek, msg, args) => { // обработка аргументов через кнопки, если текстовых не имеется
	
	// делаем включенные кнопки
	const rowBefore = new Discord.ActionRowBuilder().addComponents(
		new Discord.ButtonBuilder()
			.setCustomId("label")
			.setLabel('По борт. номеру')
			.setStyle(Discord.ButtonStyle.Primary)
			.setDisabled(false),
		new Discord.ButtonBuilder()
			.setCustomId("route")
			.setLabel('По номеру маршрута')
			.setStyle(Discord.ButtonStyle.Primary)
			.setDisabled(false),
		new Discord.ButtonBuilder()
			.setCustomId("search")
			.setLabel('Найти маршрут')
			.setStyle(Discord.ButtonStyle.Secondary)
			.setDisabled(false)
	);
	
	// делаем выключенные кнопки
	const rowAfter = new Discord.ActionRowBuilder().addComponents(
		new Discord.ButtonBuilder()
			.setCustomId("label")
			.setLabel('По борт. номеру')
			.setStyle(Discord.ButtonStyle.Primary)
			.setDisabled(true),
		new Discord.ButtonBuilder()
			.setCustomId("route")
			.setLabel('По номеру маршрута')
			.setStyle(Discord.ButtonStyle.Primary)
			.setDisabled(true),
		new Discord.ButtonBuilder()
			.setCustomId("search")
			.setLabel('Найти маршрут')
			.setStyle(Discord.ButtonStyle.Secondary)
			.setDisabled(true)
	);
	
	// Формируем сообщение для пользователя
	let embed = new Discord.EmbedBuilder()
		.setTitle('Поиск транспорта в Санкт-Петербурге')
		.setColor(nek.config.basecolor)
		.setDescription('Вы можете найти транспорт по бортовому/парковому номеру, по номеру маршрута. Вы можете найти номер маршрута, если не уверены, что он существует')
		.setFooter({text: 'Если вы не хотите каждый раз нажимать кнопки и заполнять опросник, то используйте текстовые аргументы (' + nek.config.prefix + ' orgp --help)'});
	const response = await msg.reply({
		embeds: [embed], // вкладываем embed
		components: [rowBefore] // вкладываем кнопки
	});
	
	const collectorFilter = i => i.user.id === msg.author.id; // задаем фильтр, что бы воспринимать нажатия только от изначального пользователя
	try {
		const buttonConfirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 }); // ожидаем ответа от пользователя в течение 60с
		
		// выключаем кнопки т.к. повторное их нажатие не сработает
		embed.setFooter({text: 'Кнопка была нажата. Для повторной попытки заново отправьте сообщение'})
		await response.edit({ 
			embeds: [embed], // вкладываем embed
			components: [rowAfter] // вкладываем выключенные кнопки
		});
		
		// Задаём поясняющие строки в опроснике
		let modalTitle = "Режим " + buttonConfirmation.customId; // fallback заголовок опросника
		let modalArbLabel = "Номер"; // fallback название поля с произвольным аргументом
		let typeRequired = false;
		if (buttonConfirmation.customId === 'label') { // если режим поиска по бортовому номеру
			modalTitle = "Поиск по бортовому/парковому номеру";
			modalArbLabel = "Бортовой номер";
		} else if (buttonConfirmation.customId === 'route') { // если режим поиска по маршруту
			modalTitle = "Поиск по номеру маршрута";
			modalArbLabel = "Номер маршрута";
			typeRequired = true;
		} else if (buttonConfirmation.customId === 'search') { // если режим поиска маршрута
			modalTitle = "Поиск маршрута";
			modalArbLabel = "Номер маршрута";
		}
		const modal = new Discord.ModalBuilder() // создаём опросник
			.setCustomId(buttonConfirmation.customId) // задаём id опросника, он же workMode
			.setTitle(modalTitle) // задаём заголовок опросника
			.addComponents( // добавляем компоненты
				new Discord.ActionRowBuilder().addComponents( // создаем компонент
					new Discord.TextInputBuilder() // добавляем поле ввода в компонент
						.setCustomId('arb')
						.setLabel(modalArbLabel)
						.setStyle(Discord.TextInputStyle.Short)
						.setRequired(true)
				),
				new Discord.ActionRowBuilder().addComponents( // создаем компонент
					new Discord.TextInputBuilder() // добавляем поле ввода в компонент
						.setCustomId('type')
						.setLabel("Тип транспорта")
						.setPlaceholder('троллейбус (тро...), автобус (ав...), трамвай (тра...)')
						.setStyle(Discord.TextInputStyle.Short)
						.setRequired(typeRequired)
				)
			);
		modalResponse = await buttonConfirmation.showModal(modal); // показываем опросник пользователю
		try {
			const modalConfirmation = await buttonConfirmation.awaitModalSubmit({ filter: collectorFilter, time: 60000 }); // ожидаем ответа от пользователя в течение 60с
			
			await modalConfirmation.deferUpdate(); // говорим дискорду, что запрос был обработан
			await response.delete(); // удаляем сообщение
			
			return [ // возвращаем такой массив аргументов, будто пользователь ввёл
				buttonConfirmation.customId,
				modalConfirmation.fields.getTextInputValue('type'),
				modalConfirmation.fields.getTextInputValue('arb')
			];
		} catch (e) {
			embed.setFooter({text: 'Вы не заполнили опросник в течение минуты. Запрос отменён'})
			await response.edit({
				embeds: [embed], // вкладываем embed
				components: [rowAfter] // вкладываем выключенные кнопки
			});
			return false;
		}
	} catch (e) {
		embed.setFooter({text: 'Вы не нажали на кнопку в течение минуты. Запрос отменён'})
		await response.edit({
			embeds: [embed], // вкладываем embed
			components: [rowAfter] // вкладываем выключенные кнопки
		});
		return false;
	}
}
argsProcess.cli = async (args) => { // обработка текстовых аргументов
	let argsObject = {};
	argsObject.transportType = false;
	argsObject.workMode = false;
	argsObject.arbArg = false;
	
	for await (const arg of args) {
		// тип транспорта (transport type)
		if (arg.toLowerCase().startsWith('тро') || arg.toLowerCase().startsWith('nhj')) { // троллейбус
			argsObject.transType = "trolley";
		} else if (arg.toLowerCase().startsWith('ав') || arg.toLowerCase().startsWith('fd')) { // автобус
			argsObject.transType = "bus";
		} else if (arg.toLowerCase().startsWith('тра') || arg.toLowerCase().startsWith('nhf')) { // трамвай
			argsObject.transType = "tram";
			
		// режим работы (work mode)
		} else if (arg.toLowerCase().startsWith('м') || arg == "route") {
			argsObject.workMode = "byRoute";
		} else if (arg.toLowerCase().startsWith('н') || arg == "label") {
			argsObject.workMode = "byLabel";
		} else if (arg.toLowerCase().startsWith('п') || arg == "search") {
			argsObject.workMode = "searchRoute";
			
		// любой иной произвольный аргумент (arbitrary argument)
		} else {
			argsObject.arbArg = arg.toLowerCase();
		}
	}
	return argsObject;
}

// == Обработка текстовых команд
let msgProcess = {};
msgProcess.searchByRoute = async (nek, msg, routeName, transType) => { // поиск по номеру маршрута
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
	const transports = await sillyProcess.getTransportFull(nek, transType, msg); 
	console.log(transports)
	const waitmsg = transports.m;
	let routeTransports = []; // транспорты на нужном нам маршруте
	let labels = [];
	let publicOut = []; // бортовые номера
	for await (const trans of transports.t) { // чекаем все маршруты
		if (trans.RouteShortName.toLowerCase() === routeName) { // если это маршрут, который был указан пользователем
			routeTransports.push(trans); // записать полный объект транспорта
			labels.push(trans.VehicleLabel); // записать чисто номера маршрутов (надо для создания customId кнопки)
			publicOut.push(dirToBlock[trans.RouteDirection] + " №" + trans.VehicleLabel + "\n"); // записать видимые для пользователя данные
		}
	}
	
	labels.sort(); // сортируем
	publicOut.sort(); // сортируем
	publicOut = publicOut.join(''); // преобразуем отсортированный массив в строку
	if (!routeTransports[0]) { // если ничего не нашли
		let embed = new Discord.EmbedBuilder()
			.setTitle('no bitches')
			.setColor(nek.config.errorcolor)
			.setDescription('Не нашел ничего');
		await waitmsg.edit({ embeds: [embed] });
		return;
	}
	
	// эмбед
	embed = new Discord.EmbedBuilder()
		.setTitle('Маршрут ' + routeTransports[0].RouteShortName)
		.setColor(nek.config.basecolor)
		.setDescription("Найдено " + routeTransports.length + " (" + readableType[transType] + "):\n" + publicOut + "\n" +
		"🟦 - туда / 🟧 - обратно\n" +
		"[:map: Карта маршрута](https://transport.orgp.spb.ru/routes/" + routeTransports[0].RouteId + ")");
	if (transports.l[0]) {
		embed.setFooter({text: "ВНИМАНИЕ! Был достигнут лимит сайта (" + transports.l.join(', ') + "). Имейте ввиду, что в списке присутствует не весь транспорт. Это не ваша вина, просто слишком много транспорта."});
	}
	const preId = msg.author.id + "_0_neworgp_" + transType + "_";
	
	// списки
	let selectList;
	if (labels.length <= 25) {
		selectList = new Discord.StringSelectMenuBuilder()
			.setCustomId(preId + "lp")
			.setPlaceholder('Получить больше инфы о...')
			.setDisabled(false);
		await labels.forEach((label) => {
			selectList.addOptions({
				label: label,
				value: label
			});
		});
	} else {
		selectList = new Discord.StringSelectMenuBuilder()
			.setCustomId(preId + "lp")
			.setPlaceholder('Получить больше инфы о...')
			.setDisabled(true);
		selectList.addOptions({
			label: ' ',
			value: ' '
		});
	}
	
	
	// кнопки
	const photo = new Discord.ButtonBuilder()
		.setCustomId(preId + "bp")
		.setLabel('Фото')
		.setStyle(Discord.ButtonStyle.Secondary)
		.setDisabled(true);
	const map = new Discord.ButtonBuilder()
		.setCustomId(preId + "bm")
		.setLabel('Местоположение')
		.setStyle(Discord.ButtonStyle.Secondary)
		.setDisabled(true);
	
	// создаем строки интерактивных элементов
	const listRow = new Discord.ActionRowBuilder().addComponents(selectList);
	const buttonsRow = new Discord.ActionRowBuilder().addComponents(photo, map);
	
	await waitmsg.edit({ embeds: [embed], components: [listRow, buttonsRow] });
	return;
}
msgProcess.searchByLabel = async (nek, msg, label, transType) => { // Поиск по бортовому номеру
	let embed = new Discord.EmbedBuilder()
		.setTitle('Поиск по бортовому номеру')
		.setColor(nek.config.basecolor)
		.setDescription('Пока что в разработке')
	await msg.reply({ embeds: [embed] }); // запоминаем сообщение
	return;
}
msgProcess.searchRouteName = async (nek, msg, approxName, transType) => { // Поиск маршрута
	if (!approxName) {
		let embed = new Discord.EmbedBuilder()
			.setTitle('Маршрут не найден')
			.setColor(nek.config.errorcolor)
			.setDescription('Укажите хотя бы номер маршрута')
		await msg.reply({ embeds: [embed] }); // запоминаем сообщение
		return;
	}
	const loadingString = sillyProcess.getLoadingString();
	let embed1 = new Discord.EmbedBuilder()
		.setTitle('Веду поиск...')
		.setColor(nek.config.basecolor)
		.setDescription(loadingString)
	const waitmsg = await msg.reply({ embeds: [embed1] }); // запоминаем сообщение
	
	let searchResults = await webProcess.searchRoute(approxName, transType, 0);
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
		const anotherSearchResults = await webProcess.searchRoute(approxName, transType, 20) // пропускаем первые 20 маршрутов, т.к. мы их нашли выше, и ищем ещё
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
	if (!transType) {
		transType = "любой";
	} else {
		transType = readableType[transType];
	}
	let embed = new Discord.EmbedBuilder()
		.setTitle('Поиск маршрута')
		.setColor(nek.config.basecolor)
		.setDescription("По запросу `" + approxName + "` среди типа `" + transType + "` было найдено `" + totalFound + "` маршрутов:\n" + routesList +
		'\nСоветуем для поиска воспользоватся [официальным сайтом](https://transport.orgp.spb.ru/routes)')
	await waitmsg.edit({ embeds: [embed] });
	return;
}

// == Общение с сайтом
let webProcess = {};
webProcess.createPayload = (values) => { // создать сайту отформатированный запрос. На вход объект с параметром (например {skip: 0, take: 20})
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
webProcess.searchRoute = async (name, type, skip = 0) => { // найти маршрут по номеру маршрута
	let payload;
	if (type) { // если дан тип транспорта
		payload = webProcess.createPayload({skip: skip, take: 20, transportTypes: type, routeShortName: name}); // генерируем payload
	} else {
		payload = webProcess.createPayload({skip: skip, take: 20, routeShortName: name}); // генерируем payload
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
webProcess.getTransport = async (type, bbox) => { // найти транпорт в пределах bbox
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

// == Обработка интерактивных элементов (кнопок и списков)
let interactionProcess = {};
interactionProcess.pageMap = async (nek, client, interaction) => {
	
	let label = false;
	if (interaction.values) {
		label = interaction.values[0];
	} else {
		label = interaction.message.embeds[0].data.title
		label = label.substring(1,label.indexOf(" "))
	}
	
	
	
	let buttonsRow = interaction.message.components[1]
	let listRow = interaction.message.components[0];
	// выключаем всё на время зарузки
	listRow.components[0].data.disabled = true;
	buttonsRow.components[0].data.disabled = true;
	buttonsRow.components[1].data.disabled = true;
	buttonsRow.components[1].data.label = "Загрузка..."; // меняем имя кноки "Местоположение" во время загрузки
	
	await interaction.message.edit({components: [listRow, buttonsRow]}); // отправляем выключенные кнопки
	
	let listId = listRow.components[0].data.custom_id;
	listId = listId.substring(0, listId.length-1) + "m";
	listRow.components[0].data.custom_id = listId;
	listRow.components[0].data.disabled = false; // включаем список
	buttonsRow.components[0].data.disabled = false; // включаем кнопку "Фото"
	buttonsRow.components[0].data.style = 1; // делаем кнопку "Фото" синей
	buttonsRow.components[1].data.disabled = false; // включаем кнопку "Местоположение"
	buttonsRow.components[1].data.label = "Обновить"; // меняем имя кноки "Местоположение"
	buttonsRow.components[1].data.style = 3; // делаем кнопку "Местоположение" зелёной
	console.log(buttonsRow.components[1].data);
	
	
	
	
	
	// const zoomOut = new Discord.ButtonBuilder()
		// .setCustomId(preId + "bm_" + (zoom-1))
		// .setLabel('🔎 -')
		// .setStyle(Discord.ButtonStyle.Secondary)
		// .setDisabled(false);
	// const zoomIn = new Discord.ButtonBuilder()
		// .setCustomId(preId + "bm_" + (zoom+1))
		// .setLabel('🔎 +')
		// .setStyle(Discord.ButtonStyle.Secondary)
		// .setDisabled(false);
	// const zoomRow = new Discord.ActionRowBuilder().addComponents(zoomOut, zoomIn);
	
	const type = interaction.customId.split("_")[3];
	const transports = await sillyProcess.getTransportFull(nek, type, false); // ищем по всему питеру
	let car = false;
	const map = new StaticMaps({
		width: 512,
		height: 512,
		tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
	});
	const drawCar = (map, trans) => {
		let directionRounded = Math.ceil(trans.Direction / 15) * 15; // округляем градусы по 15
		if (directionRounded >= 360) directionRounded = 0;
		const markerPath = "./src/assets/orgp/markers/" + trans.TransportType + "_" + directionRounded + ".png";
		const vehicleIconPath = "./src/assets/orgp/icons/" + trans.TransportType + "_small.png";
		const markerparam = {
			img: markerPath,
			offsetX: 32,
			offsetY: 32,
			width: 64,
			height: 64,
			coord : [trans.Location.Longitude, trans.Location.Latitude]
		};
		map.addMarker(markerparam); // рисуем стрелочку
		// const iconparam = {
			// img: vehicleIconPath,
			// offsetX: 32,
			// offsetY: 32,
			// width: 64,
			// height: 64,
			// coord : [trans.Location.Longitude, trans.Location.Latitude]
		// };
		// map.addMarker(iconparam); // рисуем иконку
		const labelText = {
			text: trans.VehicleLabel,
			size: 16,
			width: 1,
			fill: '#ffffff',
			color: '#000000',
			font: 'Impact',
			anchor: 'middle',
			offsetY: 2,
			coord : [trans.Location.Longitude, trans.Location.Latitude]
		  };
		map.addText(labelText);
		const routeText = {
			text: trans.RouteShortName,
			size: 16,
			width: 1,
			fill: '#eeeeee',
			color: '#000000',
			font: 'Impact',
			anchor: 'middle',
			offsetY: -15,
			coord : [trans.Location.Longitude, trans.Location.Latitude]
		  };
		map.addText(routeText);
		
	}
	for await (const trans of transports.t) { // чекаем все маршруты
		if (trans.VehicleLabel === label) { // если это маршрут, который был указан пользователем
			car = trans;
		} else {
			drawCar(map, trans);
		}
	}
	if (!car) {
		embed = new Discord.EmbedBuilder()
			.setTitle("№" + label + " - Местоположение")
			.setColor(nek.config.basecolor)
			.setDescription("Не удалось найти машину. Возможно она уже не на маршруте)")
		await interaction.message.edit({files: [], embeds: [embed], components: [listRow, buttonsRow]}); // отправляем
		return;
	}
	drawCar(map, car); // рисуем искомую машину в последнюю очередь, что бы она была выше всех
	const startTime2 = Date.now();
	await map.render([car.Location.Longitude, car.Location.Latitude], 15); // рендерим карту
	console.log('rendered in ' + (Date.now() - startTime2) / 1000);
	const mappic = await map.image.buffer('image/png'); // сохраняем в буфер
	const unixTime = Math.floor(Date.now() / 1000);
	embed = new Discord.EmbedBuilder()
		.setTitle("№" + label + " - Местоположение")
		.setColor(nek.config.basecolor)
		.setDescription("Карта для №" + car.VehicleLabel + " (<t:" + unixTime +":T>)")
		.setImage('attachment://' + car.VehicleLabel + '.png');
	const fileWithName = new Discord.AttachmentBuilder(mappic, { name: car.VehicleLabel + '.png' });
	await interaction.message.edit({files: [fileWithName], embeds: [embed], components: [listRow, buttonsRow]}); // отправляем
	return;		
}
interactionProcess.pagePhoto = async (nek, client, interaction) => {
	//const customId = interaction.customId.split("_"); // разделяем value по подстрочникам
	//const valueArgs = interaction.values[0].split("_"); // разделяем value по подстрочникам
	let label = false;
	if (interaction.values) {
		label = interaction.values[0];
	} else {
		label = interaction.message.embeds[0].data.title;
		label = label.substring(1,label.indexOf(" "));
	}
	const embed = new Discord.EmbedBuilder()
		.setTitle("№" + label + " - Фото")
		.setColor(nek.config.basecolor)
		.setDescription("Скоро тут будет страница с фоткой")
		
	let listRow = interaction.message.components[0];
	let listId = listRow.components[0].data.custom_id;
	listId = listId.substring(0, listId.length-1) + "p";
	listRow.components[0].data.custom_id = listId;
	
	let buttonsRow = interaction.message.components[1]
	buttonsRow.components[0].data.disabled = true; // выключаем кнопку "Фото"
	buttonsRow.components[0].data.style = 3; // делаем кнопку "Фото" зелёной
	buttonsRow.components[1].data.disabled = false; // включаем кнопку "Местоположение"
	buttonsRow.components[1].data.label = "Местоположение"; // Меняем имя кнопки "Обновить"
	buttonsRow.components[1].data.style = 1; // Меняем цвет кнопки "Местоположение" на синий
	
	await interaction.message.edit({content: ' ', files: [], embeds: [embed], components: [listRow, buttonsRow] });
	return;
}

// == Другие функции
let sillyProcess = {};
sillyProcess.getLoadingString = () => {
	const funnyLoadingStrings = [ // всякие смешнявки в момент обращения к серверу
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
	if (Math.random() > 0.5) { // вероятость 50/50
		return funnyLoadingStrings[Math.floor(Math.random() * (funnyLoadingStrings.length))]; // получаем рандомную смешнявку
	} else {
		return funnyLoadingStrings[0]; // получаем нормальную строку
	}
}
sillyProcess.getTransportFull = async (nek, transType, msg) => {
	let loadingString;
	let embed;
	let waitmsg;
	if (msg) {
		loadingString = sillyProcess.getLoadingString();
		embed = new Discord.EmbedBuilder()
			.setTitle('Веду поиск...')
			.setColor(nek.config.basecolor)
			.setDescription(loadingString);
		waitmsg = await msg.reply({ embeds: [embed] }); // запоминаем сообщение
	}
	
	let transports = await webProcess.getTransport(transType, fullbbox); // ищем по всему питеру
	if (!transports) { // если ничего не найдено (или произошла ошибка)
		return false;
	}
	
	let limitReached = [];
	if (transports.length === 1000) { // если мы уперлись в лимит запроса
		let counter = 0;
		if (msg) {
			embed = new Discord.EmbedBuilder()
			.setTitle('Веду поиск...')
			.setColor(nek.config.basecolor)
			.setDescription(loadingString + ' `' + counter + '/' + partbboxes.length + "`");
			await waitmsg.edit({ embeds: [embed] });
		}
		
		// начинаем поиск по зонам
		transports = [];
		for await (const bbox of partbboxes) {
			counter += 1;
			const transPart = await webProcess.getTransport(transType, bbox);
			transports = [...transports, ...transPart];
			if (transPart.length === 1000) {
				limitReached.push(counter); // запоминаем на какой попытке мы уперлись в лимит
			}
			if (msg) {
				embed = new Discord.EmbedBuilder()
					.setTitle('Веду поиск...')
					.setColor(nek.config.basecolor)
					.setDescription(loadingString + ' `' + counter + '/' + partbboxes.length + "`");
				await waitmsg.edit({ embeds: [embed] });
			}
		}
	}
	return {t: transports, l: limitReached, m: waitmsg};
}

module.exports = NewOrgp;