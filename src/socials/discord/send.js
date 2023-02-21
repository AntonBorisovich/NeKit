//const Discord = require('discord.js');

class Send {
	send(msgcontent, msg){
		if (typeof msgcontent === "string") { // if simple text
			this.log('SEND', 'Отправлено сообщение', 'blue');
			msg.reply({content: msgcontent.replace(/&lt/g, "<").replace(/&gt/g, ">")});
		} else {
			this.log('ERROR', 'Expected string, but got mr beast', 'red');
			msg.reply({content: 'ERROR'});
		};
	};
};

module.exports = Send;