//const { Telegraf } = require('telegraf');

class Send {
	send(msgcontent, msg, arg){
		if (typeof msgcontent === "string" && !arg) { // если простой текст инету аргументов
			this.log('SEND', 'Отправлено сообщение', 'blue');
			msg.replyWithHTML(msgcontent);
		} else if (arg) {
			if (typeof arg === "object") { // если есть аргументы
				switch(arg.filetype) { // если в аргументах указан тип отправляемого материала, то проверить чё это
					case 'image': // статичная картинка
						this.log('SEND', 'Отправлено сообщение с фото', 'blue');
						switch(arg.storetype) {
							case 'url':
								if (!msgcontent) {
									msg.replyWithPhoto(arg.image);
									break;
								} else {
									msg.replyWithPhoto(msgcontent);
								}
								break;
							case 'buffer':
								if (!msgcontent) {
									msg.replyWithPhoto({source: arg.image});
								} else {
									msg.replyWithPhoto(msgcontent);
								}
								break;
						};
						break;
					case 'gif': // анимация
						this.log('SEND', 'Отправлено сообщение с гифкой', 'blue');
						msg.replyWithAnimation(msgcontent);
						break;
					case 'file': // любой другой файл
						this.log('SEND', 'Отправлено сообщение с файлом', 'blue');
						msg.replyWithAnimation(msgcontent);
						break;
					default:
						this.log('ERROR', 'unknown argument', 'red');
						msg.reply('ERR');
						break;
				};
				
			};
		} else {
			this.log('ERROR', 'got mr beast', 'red');
			msg.reply('ERR');
		};
	};
};

module.exports = Send;