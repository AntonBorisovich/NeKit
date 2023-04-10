const { EmbedBuilder } = require("discord.js");

class Info {
    constructor(nek, config){
		
		//задать полученые значения для дальнейшего использования в коде команды
		//this.nek = nek;
        //this.config = config;
		
		this.category = "info"; // категория команд
		this.hidden = false; // можно ли отображать команду в общем списке
		
		this.perms = [];
        this.name = "info"; // имя команды
		this.desc = "информация"; // описание команды в общем списке команд
		this.advdesc = "Информация о боте"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = ""; // описание аргументов в помоще по конкретной команде
		this.advargs = ""; // аргументы в помоще по конкретной команде
    }

    run(nek, client, msg, args){
		let embed = new EmbedBuilder()
			.setTitle(client.user.username + ' - ' + this.name)
			.setColor(nek.basecolor)
			.setDescription(nek.config.info + '\nРазработчик: <@' + nek.config.developers[0] + '>')
			.setFooter({ text: 'Версия бота: ' + nek.version + "\nВерсия node: " + process.version + "\nВерсия Discord.js: v14.9.0" });
		msg.reply({ embeds: [embed] });
	}
	
}

module.exports = Info

