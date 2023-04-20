const Discord = require("discord.js");
const https = require("https");
const StaticMaps = require('staticmaps');
const numco = require("numco");

const fullbbox = "31.262970,60.444011,28.473816,59.451358"; // https://i.imgur.com/l6al1YY.png

const partbboxes = [ // https://i.imgur.com/ljnXWyw.png
"31.262970,60.444011,28.473816,60.077345", // top
"31.262970,60.077345,28.473816,59.983189", // upcity
"31.262970,59.983189,28.473816,59.905812", // midcity
"31.262970,59.905812,28.473816,59.830670", // downcity
"31.262970,59.830670,28.473816,59.451358"] // bottom

// для нормального отображения типа транспорта
const readableType = {
	'trolley': 'Троллейбус',
	'bus': 'Автобус',
	'tram': 'Трамвай'
}

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
		this.args = "<тип> <номер>"; // аргументы в общем списке команд
		this.argsdesc = "<тип> - троллейбус (тро...), автобус (ав...), трамвай (тра...)\n<номер> - номер маршрута"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<тип> <номер>"; // аргументы в помоще по конкретной команде
    };

    async run(nek, kitsune, msg, args){
		args.shift(); // режем первый аргумент т.к. это название команды
		let type = false;
		let routeName = false;
		
		let search = false;
		//let extended = false;
		
		for await (const arg of args) {  
			if (arg.toLowerCase().startsWith('тро') || arg.toLowerCase().startsWith('nhj')) { // троллейбус
				type = "trolley";
			} else if (arg.toLowerCase().startsWith('ав') || arg.toLowerCase().startsWith('fd')) { // автобус
				type = "bus";
			} else if (arg.toLowerCase().startsWith('тра') || arg.toLowerCase().startsWith('nhf')) { // трамвай
				type = "tram";
			} else if (arg.toLowerCase() === 'search') {
				search = true;
			} else { // предположительно номер маршрута
				routeName = arg.toLowerCase();
			}
		}
		
		if (!routeName) { // если не указан номер маргрута
			let embed = new Discord.EmbedBuilder()
			.setTitle('А че искать?')
			.setColor(nek.config.errorcolor)
			.setDescription('Укажите номер маршрута')
			await msg.reply({ embeds: [embed] });
			return;
		}
		if (!type) { // если не указан номер маргрута
			let embed = new Discord.EmbedBuilder()
			.setTitle('А че искать?')
			.setColor(nek.config.errorcolor)
			.setDescription('Укажите тип транспорта, я разучился его угадывать')
			await msg.reply({ embeds: [embed] });
			return;
		}
		
		
		// if (search) {} // поиск маршрута
		
		
		//simpleList();
		let loadingString;
		if (Math.random() > 0.5) { // вероятость 50/50
			loadingString = funnyLoadingStrings[Math.floor(Math.random() * (funnyLoadingStrings.length))]; // получаем рандомную смешнявку
		} else {
			loadingString = funnyLoadingStrings[0] // получаем нормальную строку
		}
		
		//async function simpleList() {
			let embed = new Discord.EmbedBuilder()
				.setTitle('Веду поиск...')
				.setColor(nek.config.basecolor)
				.setDescription(loadingString)
			const waitmsg = await msg.reply({ embeds: [embed] }); // запоминаем сообщение
			
			let transports  = await this.getTransport(type, fullbbox); // ищем по всему питеру
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
					const transPart  = await this.getTransport(type, bbox);
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
			let outRoutes = []; // бортовые номера
			for await (const trans of transports) { // чекаем все маршруты
				if (trans.RouteShortName.toLowerCase() === routeName) { // если это маршрут, который был указан пользователем
					routeTransports.push(trans); // в книжечку записать
					outRoutes.push(dirToBlock[trans.RouteDirection] + " №" + trans.VehicleLabel + "\n");
				}
			}
			outRoutes.sort(); // сортируем
			outRoutes = outRoutes.join(''); // преобразуем отсортированный массив в строку
			if (!routeTransports[0]) { // если ничего не нашли
				let embed = new Discord.EmbedBuilder()
				.setTitle('no bitches')
				.setColor(nek.config.errorcolor)
				.setDescription('Не нашел ничего')
				await waitmsg.edit({ embeds: [embed] });
				return;
			}
			embed = new Discord.EmbedBuilder()
				.setTitle('Маршрут ' + routeTransports[0].RouteShortName)
				.setColor(nek.config.basecolor)
				.setDescription("Найдено " + routeTransports.length + " (" + readableType[type] + "):\n" + outRoutes + "\n" +
				"🟦 - туда / 🟧 - обратно")
			if (limitReached) {
				embed.setFooter({text: "ВНИМАНИЕ! Был достигнут лимит сайта. Имейте ввиду, что в списке присутствует не весь транспорт. Это не ваша вина, просто слишком много транспорта."});
			}
			await waitmsg.edit({ embeds: [embed] });
		//}
		return;
		//async function extendedList() {}
		
///////// МАПА
		const randomNumber = Math.floor(Math.random() * (routeTransports.length));
		const car = routeTransports[randomNumber];
		
		embed = new Discord.EmbedBuilder()
			.setTitle('Эксперемексы')
			.setColor(nek.config.basecolor)
			.setDescription("Генерирую карту для " + car.VehicleLabel + "...")
		const mapmsg = await msg.reply({ embeds: [embed] });
		
		
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
		await mapmsg.edit({files: [fileWithName], embeds: [embed]}); // отправляем
		return;		
	}

	createPayload(values){ // создать сайту отформатированный запрос. На вход объект с параметром (например {skip: 0, take: 20})
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
	async searchRoute(name, type) { // найти маршрут по номеру маршрута
		let payload
		if (type) { // если дан тип транспорта
			payload = createPayload({skip: 0, take: 20, transportTypes: type, routeShortName: name}); // генерируем payload
		} else {
			payload = createPayload({skip: 0, take: 20, routeShortName: name}); // генерируем payload
		}
		console.log(payload.body)
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
	
	async getTransport(type, bbox) {
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
	interaction(kitsune, interaction, args){
		if (interaction.values[0]) {
			get_stts_vehicle(kitsune, interaction, args, interaction.values[0].split("_"))
		}
		return;
	}
};

module.exports = Orgp;

