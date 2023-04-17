const Discord = require("discord.js");
const https = require("https");
const numco = require("numco");

const fullbbox = 		"31.262970,60.444011,28.473816,59.451358"; // https://i.imgur.com/l6al1YY.png

const upperbbox = 		"31.262970,60.444011,28.473816,60.077345"; // https://i.imgur.com/3YGHqB5.png
const upcitybbox = 		"31.262970,60.077345,28.473816,59.975975"; // https://i.imgur.com/3YGHqB5.png
const downcitybbox = 	"31.262970,59.975975,28.473816,59.830670"; // https://i.imgur.com/3YGHqB5.png
const downbbox = 		"31.262970,59.830670,28.473816,59.451358"; // https://i.imgur.com/3YGHqB5.png

// для нормального отображения типа транспорта
let readableType = [];
readableType['trolley'] = "Троллейбус";
readableType['bus'] = "Автобус";
readableType['tram'] = "Трамвай";

class Orgp {
	constructor(nek){
		
		this.category = "info"
		
		this.perms = ["EMBED_LINKS"];
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
		
		if (!routeName) { // если ничего не нашли
			let embed = new Discord.EmbedBuilder()
			.setTitle('А че искать?')
			.setColor(nek.config.errorcolor)
			.setDescription('Укажите хотя бы номер маршрута')
			await msg.reply({ embeds: [embed] });
			return;
		}
		await msg.channel.sendTyping();
		let transports  = await getTransport(type, fullbbox);
		if (!transports) {
			let embed = new Discord.EmbedBuilder()
			.setTitle('Каво')
			.setColor(nek.config.errorcolor)
			.setDescription('Не удалось получить ответ от сайта. Попробуйте ещё раз')
			await msg.reply({ embeds: [embed] });
			return;
		}
		if (transports.length === 1000) {
			console.log('transport overflow');
			let embed = new Discord.EmbedBuilder()
			.setTitle('Их слишком много~')
			.setColor(nek.config.basecolor)
			.setDescription('На маршрутах слишком много транспорта. Их поиск займет ещё секунд 10...')
			await msg.reply({ embeds: [embed] });
			await msg.channel.sendTyping();

			const trans1  = await getTransport(type, upperbbox);
			const trans2  = await getTransport(type, upcitybbox);
			const trans3  = await getTransport(type, downcitybbox);
			const trans4  = await getTransport(type, downbbox);
			transports = [...trans1, ...trans2, ...trans3, ...trans4];
		}
		let routeTransports = [];
		let out = "```\n";
		let counter = 0;
		console.log('total routes: ' + transports.length);
		for await (const trans of transports) {
			if (trans.RouteShortName.toLowerCase() === routeName) {
				console.log('found!')
				routeTransports.push(trans);
				out += "№" + trans.VehicleLabel + " - " + trans.TransportType + "\n";
			}
		}
		console.log('total found: ' + routeTransports.length);
		if (!routeTransports[0]) { // если ничего не нашли
			let embed = new Discord.EmbedBuilder()
			.setTitle('no bitches')
			.setColor(nek.config.errorcolor)
			.setDescription('Не нашел ничего')
			await msg.reply({ embeds: [embed] });
			return;
		}
		let embed = new Discord.EmbedBuilder()
			.setTitle('Ну типо')
			.setColor(nek.config.basecolor)
			.setDescription("Чето нашел:\n" + out + "```")
			.setFooter({text: "Пока это всё, что умеет эта команда. Скоро я прикручу transphotos, fotobus и всякое другое."})
		await msg.reply({ embeds: [embed] });
		return;


/////////


		const routes = await searchRoutes(routeName, type); // ищем маршруты
		
		let exactRoutes = []
		for await (const route of routes) {
			console.log(route.ShortName);
			if (route.ShortName.toLowerCase() === routeName) { // если есть ТОЧНОЕ совпадение имени
				exactRoutes.push(route);
			}
		}
		if (!exactRoutes[0]) { // если ничего не нашли
			let embed = new Discord.EmbedBuilder()
			.setTitle('no bitches')
			.setColor(nek.config.errorcolor)
			.setDescription('Не нашел ничего')
			msg.reply({ embeds: [embed] });
			return;
		}
		if (exactRoutes.length !== 1) { // если найдено несколько маршрутов
			let out = "```\n"
			for await (const route of exactRoutes) {
				out += route.ShortName + " - " + readableType[route.TransportType] + "\n";
			}
			let embed = new Discord.EmbedBuilder()
				.setTitle('А какой именно?')
				.setColor(nek.config.errorcolor)
				.setDescription("Было найдено несколько маршрутов. Попробуйте снова указав один из них:\n" + out + "```")
			msg.reply({ embeds: [embed] });
			return;
		}
		embed = new Discord.EmbedBuilder()
			.setTitle('ааааааа')
			.setColor(nek.config.basecolor)
			.setDescription("Ща погоди, погоди. Дай кое-чё попробую. \\*трансформируется в сбермегамаркет\\*")
		msg.reply({ embeds: [embed] });
		return;
		
		function createPayload(values){ // создать сайту отформатированный запрос. На вход объект с параметром (например {skip: 0, take: 20})
			// генерируем разделятор
			let webkit = '----WebKitFormBoundary';
			let counter = 0;
			while (counter < 16) {
			  webkit += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62)); // берём рандом символ и пихаем
			  counter += 1;
			}

			// делаем тело
			let outputBody = ""; // duh
			for (var [key, value] of Object.entries(values)) {
				outputBody += "--" + webkit + "\r\n"; // пишем разделятор
				outputBody += "Content-Disposition: form-data; name=\"" + key + "\"\r\n"; // пишем тип данных и их название, скип строки
				outputBody += "\r\n"; // скипаем строку потому что bruh
				outputBody += value + "\r\n"; // пишем значение и скипаем строку
			}
			outputBody += "--" + webkit + "--"; // пишем финальный разделятор
			const encoder = new TextEncoder();  // создаем энкодер
			return {boundary: webkit, body: encoder.encode(outputBody)}; 
		}
		
		async function searchRoutes(name, type) { // найти маршрут по номеру маршрута
			console.log('getting cock');
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

