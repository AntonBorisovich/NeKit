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
			.setTitle('Информация о боте')
			.setColor(nek.basecolor)

		let devstring = ""
		nek.config.developers.forEach(id => {
			devstring += '<@' + id + '>, ';
		});
		devstring = devstring.substring(0, devstring.length - 2)

		let thxstring = ""
		nek.config.thanks.forEach(id => {
			thxstring += '<@' + id + '>, ';
		});
		thxstring = thxstring.substring(0, thxstring.length - 2)

		embed.setDescription(nek.config.info + '\n\nРазработчики: ' + devstring + '\nБлагодарности: ' + thxstring)

		msg.reply({ embeds: [embed] });
	}
	
}

module.exports = Info

