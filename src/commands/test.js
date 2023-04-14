const Discord = require("discord.js");

class Test {
    constructor(nek){
		
		//задать полученые значения для дальнейшего использования в коде команды
		//this.nek = nek;
        //this.config = config;
		
		this.category = "test"; // категория команд
		this.hidden = true; // можно ли отображать команду в общем списке
		
		this.perms = ["EMBED_LINKS", "ATTACH_FILES"];
        this.name = "test"; // имя команды
		this.desc = "тест desc"; // описание команды в общем списке команд
		this.advdesc = "тест advdesc"; // описание команды в помоще по конкретной команде
		this.args = "тест args"; // аргументы в общем списке команд
		this.argsdesc = "тест argsdesc"; // описание аргументов в помоще по конкретной команде
		this.advargs = "тест advargs"; // аргументы в помоще по конкретной команде
    }

    run(nek, client, msg, args){
		let embed = new Discord.EmbedBuilder() // составляем embed
			.setTitle('тесто') // заголовок
			.setColor(nek.config.basecolor) // цвет
		msg.reply({ embeds: [embed] }); // отправить
		return;
	}
	
}

module.exports = Test

