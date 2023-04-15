const Discord = require("discord.js");

class GetAttach {
    constructor(nek){
        this.name = "getAttach";
		this.version = "1.0"
    }
	
	// Получение вложений
	//
	// ВХОД:
	//  nek - nek
	//  msg - msg
	//  method - метод получения вложения
	//   > "msg"    - прямо в сообщении
	//   > "reply"  - в сообщении, на которое ответил пользователь
	//   > "inChat" - в чате в последних n сообщениях. n задаётся параметром limit
	//   > "any"    - все перечисленные выше способы по порядку.
	//  type - тип вложения
	//   > "image" - jpg, png, gif...
	//   > "video" - mp4, mov, webm...
	//   > "any"   - любое
	//  limit - ограничение поиска в чате. Имеет смысл указывать только если метод равен inChat или any
	//   > если не указан или равен нулю, то поиск в чате будет пропущен
	//  onlyFirst - остановить поиск после первого же найденного вложения, помогает сохранить время (true или false)
	//
	// ВЫХОД:
	//  Массив найденных вложений в объекте. Пример одного из объектов из массива для вложения типа image/png:
	//  > {
	//	> 	attachment: 'ссылка_на_файл',
	//	>   name: 'имя_файла',
	//	>   id: 'id',
	//	>   size: 'размер_в_байтах',
	//	>   url: 'ссылка_на_файл',
	//	>   proxyURL: 'ссылка_на_файл_через_прокси',
	//	>   height: 'высота_в_пикселях',
	//	>   width: 'ширина_в_пикселях',
	//  >   contentType: 'image/png',
	//  >   description: 'описание_(alt_текст)' 
	//	> }
	//  если ничего не найдено, то и будет пустой массив ( [] )
	//
    async getAttach(nek, msg, method, type, limit, onlyFirst){
		let attachments = [];
		if (!type) type = "any";
		if (method === "msg" || method === "any") {
			if (msg.attachments) { // если у сообщения есть вложение 
				if (type !== 'any') { // если надо конкретный тип вложения
					await msg.attachments.forEach(attach => { // проверяем тип у каждого вложения
						if (attach.contentType.startsWith(type)) { // если тип совпадает с запрашиваемым
							attachments = [...attachments, attach]; // то записываем
						}
					});
				} else { // если по барабану
					attachments = [...attachments, ...msg.attachments.values()]; // то записываем все
				}
			}
		}
		if (attachments[0] && onlyFirst) {
			return [attachments[0]];
		}
		if (method === "reply" || method === "any") {
			if (msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags.ReadMessageHistory]) && msg.type == "19" && msg.reference !== null) {
				// если можно читать историю сообщений |И| сообщение является ответом на что-то |И| сообщение, на которое был дан ответ всё ещё существует
				const msgrep = await msg.fetchReference(); // ищем сообщение, на которое был дан ответ
				if (msgrep?.attachments) { // если у сообщения есть вложение
					if (type !== 'any') { // если надо конкретный тип вложения
						await msgrep.attachments.forEach(attach => { // проверяем тип у каждого вложения
							if (attach.contentType.startsWith(type)) { // если тип совпадает с запрашиваемым
								attachments = [...attachments, attach]; // то записываем
							}
						});
					} else { // если по барабану
						attachments = [...attachments, ...msgrep.attachments.values()]; // то записываем все
					}
				}
			}
		}
		if (attachments[0] && onlyFirst) {
			return [attachments[0]];
		}
		if (method === "inChat" || method === "any" && limit) {
			const messages = await msg.channel.messages.fetch({ limit: limit });
			await messages.forEach(async (msgsas) => {
				if (msgsas.attachments) { // если у сообщения есть вложение
					if (type !== 'any') { // если надо конкретный тип вложения
						await msgsas.attachments.forEach(attach => { // проверяем тип у каждого вложения
							if (attach.contentType.startsWith(type)) { // если тип совпадает с запрашиваемым
								attachments = [...attachments, attach]; // то записываем
							}
						});
					} else { // если по барабану
						attachments = [...attachments, ...msgsas.attachments.values()]; // то записываем все
					}
				}
			});
		}
		if (attachments[0] && onlyFirst) {
			return [attachments[0]];
		}
		return attachments;
	}
}

module.exports = GetAttach;

