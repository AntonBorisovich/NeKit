const Discord = require("discord.js");
const https = require("https");
const StaticMaps = require('staticmaps');
const numco = require("numco");

const fullbbox = 		"31.262970,60.444011,28.473816,59.451358"; // https://i.imgur.com/l6al1YY.png

const upperbbox = 		"31.262970,60.444011,28.473816,60.077345"; // https://i.imgur.com/3YGHqB5.png
const upcitybbox = 		"31.262970,60.077345,28.473816,59.983189"; // https://i.imgur.com/3YGHqB5.png
const midcitybbox = 	"31.262970,59.983189,28.473816,59.905812"; // о
const downcitybbox = 	"31.262970,59.905812,28.473816,59.830670"; // https://i.imgur.com/3YGHqB5.png
const downbbox = 		"31.262970,59.830670,28.473816,59.451358"; // https://i.imgur.com/3YGHqB5.png

// для нормального отображения типа транспорта
let readableType = [];
readableType['trolley'] = "Троллейбус";
readableType['bus'] = "Автобус";
readableType['tram'] = "Трамвай";

let dirToBlock = [];
dirToBlock[0] = "🟦";
dirToBlock[1] = "🟧";

class Orgp {
	constructor(nek){
		
		this.category = "info"
		
		this.perms = ["EMBED_LINKS", "ATTACH_FILES"];
        this.name = "orgp"; // имя команды
		this.desc = "питерский транспорт"; // описание команды в общем списке команд
		this.advdesc = "Берёт информацию о маршрутах в Санкт-Петербурге с [сайта \"Портал Общественного Транспорта Санкт-Петербурга\"](https://transport.orgp.spb.ru/).\nФото и данные о машинах предоставляются сайтом [transphoto.org](https://transphoto.org).\n\nСделано специально для <@374144960221413386>"; // описание команды в помоще по конкретной команде
		this.args = "<тип> <номер>"; // аргументы в общем списке команд
		this.argsdesc = "<тип> - троллейбус (тро..), автобус (ав..), трамвай (тра..)\n<номер> - номер маршрута"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<тип> <номер>"; // аргументы в помоще по конкретной команде
    };

    async run(nek, kitsune, msg, args){
		args.shift(); // режем первый аргумент т.к. это название команды
		let type = false;
		let routeName = false;
		for await (const arg of args) {  
			if (arg.toLowerCase().startsWith('тро') || arg.toLowerCase().startsWith('nhj')) { // троллейбус
				type = "trolley";
			} else if (arg.toLowerCase().startsWith('ав') || arg.toLowerCase().startsWith('fd')) { // автобус
				type = "bus";
			} else if (arg.toLowerCase().startsWith('тра') || arg.toLowerCase().startsWith('nhf')) { // трамвай
				type = "tram";
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
		let embed = new Discord.EmbedBuilder()
			.setTitle('Веду поиск...')
			.setColor(nek.config.basecolor)
			.setDescription('Подключаемся к серверу...') // TODO: рандомная смешнявка
		const waitmsg = await msg.reply({ embeds: [embed] }); // запоминаем сообщение
		
		let transports  = await getTransport(type, fullbbox); // ищем по всему питеру
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
			let embed = new Discord.EmbedBuilder()
			.setTitle('Веду поиск...')
			.setColor(nek.config.basecolor)
			.setDescription('Подключаемся к серверу... `0%`')
			await waitmsg.edit({ embeds: [embed] });
			
			// начинаем поиск по зонам
			let transPart  = await getTransport(type, upperbbox);
			transports = [...transports, ...transPart];
			if (transPart.length === 1000) {
				limitReached = true;
			}
			embed = new Discord.EmbedBuilder()
				.setTitle('Веду поиск...')
				.setColor(nek.config.basecolor)
				.setDescription('Подключаемся к серверу... `25%`')
			await waitmsg.edit({ embeds: [embed] });
			
			transPart  = await getTransport(type, upcitybbox);
			transports = [...transports, ...transPart];
			if (transPart.length === 1000) {
				limitReached = true;
			}
			embed = new Discord.EmbedBuilder()
				.setTitle('Веду поиск...')
				.setColor(nek.config.basecolor)
				.setDescription('Подключаемся к серверу... `50%`')
			await waitmsg.edit({ embeds: [embed] });
			
			transPart  = await getTransport(type, midcitybbox);
			transports = [...transports, ...transPart];
			if (transPart.length === 1000) {
				limitReached = true;
			}
			embed = new Discord.EmbedBuilder()
				.setTitle('Веду поиск...')
				.setColor(nek.config.basecolor)
				.setDescription('Подключаемся к серверу... `75%`')
			await waitmsg.edit({ embeds: [embed] });
			
			transPart  = await getTransport(type, downcitybbox);
			transports = [...transports, ...transPart];
			if (transPart.length === 1000) {
				limitReached = true;
			}
			embed = new Discord.EmbedBuilder()
				.setTitle('Веду поиск...')
				.setColor(nek.config.basecolor)
				.setDescription('Подключаемся к серверу... `100%`')
			await waitmsg.edit({ embeds: [embed] });
			
			transPart  = await getTransport(type, downbbox);
			transports = [...transports, ...transPart];
			if (transPart.length === 1000) {
				limitReached = true;
			}
		}
		let routeTransports = []; // транспорты на нужном нам маршруте
		let outRoutes = []; // бортовые номера
		for await (const trans of transports) { // чекаем все маршруты
			if (trans.RouteShortName.toLowerCase() === routeName) { // если это маршрут, который был указан пользователем
				routeTransports.push(trans); // в книжечку записать
				outRoutes.push(dirToBlock[trans.RouteDirection] + " №" + trans.VehicleLabel + "\n")
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
			.setTitle('Ну типо')
			.setColor(nek.config.basecolor)
			.setDescription("Найдено " + routeTransports.length + " (" + readableType[type] + "):\n" + outRoutes + "\n" +
			"🟦 - туда / 🟧 - обратно")
		if (limitReached) {
			embed.setFooter({text: "ВНИМАНИЕ! Был достигнут лимит сайта. Имейте ввиду, что в списке присутствует не весь транспорт. Это не ваша вина, просто слишком много транспорта."});
		}
		await waitmsg.edit({ embeds: [embed] });
		
		
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

		async function getTransport(type, bbox) {
			let transport = ''
			if (type) {
				transport = 'transport=' + type + '&'
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
				req.end();
			})
		}
	}
	butt(kitsune, interaction, args){
		if (interaction.values[0]) {
			get_stts_vehicle(kitsune, interaction, args, interaction.values[0].split("_"))
		} else {
			return;
		};
		function get_stts_vehicle(kitsune, interaction, args, vallu) { // get last photo from transphoto.org
		
			// types
			//
			// 1 - tram
			// 2 - trolleybus
			
			// bus is not supported on this site!
			let numtype
			if (vallu[0] == "tram") {
				numtype = 1;
			} else if (vallu[0] = 'trolley') {
				numtype = 2;
			} else {
				console.log('no you cant search that type of transphoto.org ')
				return;
			}
			const options = { // параметры обращения к серваку
			  uri: 'https://transphoto.org/api.php?action=index-qsearch&cid=2&type=' + numtype + '&num=' + vallu[1],
			  headers: {
				"authority": "transphoto.org",
				"scheme": "https"
			  }
			};
			request.get(options, (err, res, body) => { // обращаемся к серваку
				if (body) {
					if (body.indexOf('href') != -1) {
						let vehicle_page = body.slice(body.indexOf('href')+6)
						vehicle_page = vehicle_page.slice(0, vehicle_page.indexOf('"'))
						vehicle_page = 'https://transphoto.org' + vehicle_page
						get_stts_photodate(kitsune, interaction, args, vallu, vehicle_page)
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - orgp')
						embed.setColor(`#F00000`)
						embed.setDescription('Не удалось получить информацию о ' + vallu[1])
						interaction.reply({ embeds: [embed]})
						return;
					}
				} else {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - orgp')
					embed.setColor(`#F00000`)
					embed.setDescription('Не удалось получить информацию о ' + vallu[1])
					interaction.reply({ embeds: [embed]})
					return;
				}
			});
		};
		
		function get_stts_photodate(kitsune, msg, args, vallu, link) { // get last photo data from transphoto.org vehicle page
			msg.deferUpdate();
			const options = { // параметры обращения к серваку
			  uri: link,
			  headers: {
				"authority": "transphoto.org",
				"scheme": "https"
			  }
			};
			request.get(options, (err, res, body) => { // обращаемся к серваку
				if (body) {
					let model_info = false
					let park_info = false
					let park_link = false
					let photo_place = false
					let photo_date = false
					let photo_author = false
					let photo_link = false
					let photo_img = false
					
					if (body.indexOf('<a href="/model/') != 1) {
						model_info = body.slice(body.indexOf('<a href="/model/'))
						model_info = model_info.slice(model_info.indexOf('/">')+3,model_info.indexOf('</b>'))
					};
					if (body.indexOf('<a href="/list.php?did=') != 1) {
						park_info = body.slice(body.indexOf('<a href="/list.php?did='))
						park_info = park_info.slice(park_info.indexOf('">')+2,park_info.indexOf('</a>'))
					};
					if (body.indexOf('<a href="/list.php?did=') != 1) {
						park_link = body.slice(body.indexOf('<a href="/list.php?did=')+9, )
						park_link = park_link.slice(0,park_link.indexOf('">'))
						if (park_link.length > 64) {
							park_link = "https://youtu.be/dQw4w9WgXcQ"
						}
					};
					if (body.indexOf('<b class="pw-place">') != 1 ) { 
						photo_place = body.slice(body.indexOf('<b class="pw-place">')+20)
						photo_place = photo_place.slice(0,photo_place.indexOf('</b>'))
						photo_place = photo_place.replace(/&quot;/g, '"')
						photo_place = photo_place.replace(/<img src=\"\/img\/place_arrow.gif\" alt=\"→\" width=\"15\" height=\"11\" style=\"position:relative; top:-1px; margin:0 3px\">/g, '▶')
						photo_place = photo_place.replace(/<img src=\"\/img\/place_arrow.gif\" alt=\"\/\" width=\"15\" height=\"11\" style=\"position:relative; top:-1px; margin:0 3px\">/g, '▶')
						if (photo_place.length > 196) {
							photo_place = "нету"
						}
					}
					if (body.indexOf('<p class="sm"><b>') != 1 ) { 
						photo_date = body.slice(body.indexOf('<p class="sm"><b>')+17)
						photo_author = photo_date.slice(photo_date.indexOf('<a gref=')+8, photo_date.indexOf('</a>'))
						photo_author = photo_author.slice(photo_author.indexOf('/">')+3)
						if (photo_author.length > 64) {
							photo_author = "*(не получилось узнать)*"
						}
						photo_date = photo_date.slice(0,photo_date.indexOf('</b>'))
						if (photo_date.length > 64) {
							photo_date = "нету"
						}
					};
					if (body.indexOf('<td class="pb_photo">') != 1 ) { 
						photo_img = body.slice(body.indexOf('<td class="pb_photo">')+21)
						
						photo_link = photo_img.slice(photo_img.indexOf('<a href="')+9)
						photo_link = photo_link.slice(0, photo_link.indexOf('"'))
						photo_link = 'https://transphoto.org' + photo_link
						if (photo_link.length > 128) {
							photo_link = "https://youtu.be/dQw4w9WgXcQ"
						}
						
						photo_img = photo_img.slice(photo_img.indexOf('<img class="f" src="')+20)
						photo_img = photo_img.slice(0, photo_img.indexOf('" alt'))
						photo_img = 'https://transphoto.org' + photo_img
						photo_img = photo_img.replace(/_s/g, "")
						if (photo_img.length > 128) {
							photo_img = "https://i.imgur.com/oJGKR0l.png"
						}
					};
					if (model_info && park_info && park_link && photo_place && photo_date && photo_author && photo_link && photo_img) {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - orgp')
						embed.setColor(`#F36B00`)
						embed.setDescription("[**" + model_info + " №" + vallu[1] + "**](" + photo_link + ")\n[" + park_info +"](https://transphoto.org" + park_link + ")")
						embed.addFields({ name: "Последнее фото №" + vallu[1] + " на transphoto.org", value: "Улица: " + photo_place + "\nДата: " + photo_date + "\nАвтор: " + photo_author})
						embed.setImage(photo_img)
						
						let list = new Discord.StringSelectMenuBuilder()
						list.setCustomId(msg.customId + "1")
						list.setPlaceholder('Получить больше инфы о...')
						numco.decompress(vallu[2]).forEach((car) => {
							if (car != "") {
								list.addOptions({
									label: String(car),
									value: String(vallu[0] + "_" + car + "_" + vallu[2])
								});
							}
						});
						
						let row = new Discord.ActionRowBuilder().addComponents(list);
						msg.message.edit({ embeds: [embed], components: [row] });
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - orgp')
						embed.setColor(`#F00000`)
						embed.setDescription("Ну удалось получить данные о " + label)
						msg.reply({ embeds: [embed] });
					}
					
					
				}
				//get_cars_on_route(kitsune, msg, args, id)
			});
		};
		
	}
};

module.exports = Orgp;

