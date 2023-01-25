const Discord = require('discord.js');

class Send {
	constructor(nek, config){
		//задать полученые значения для дальнейшего использования в коде команды
		this.nek = nek;
		
		this.desc = "Модуль отправки сообщений"
    }
	
	send(msgcontent, msg){
		if (typeof content === "string") { // if simple text
			msg.reply({content: msgcontent})
		} else {
			this.nek.log('wtf', 'mr beast')
		}
	}
}

module.exports = Send