const Discord = require("discord.js");

class Test {
    constructor(nek){
		this.version = "version";		
		
		this.category = "test"; // категория команд
		this.hidden = true; // можно ли отображать команду в общем списке
		
		this.perms = ["EMBED_LINKS"];
        this.name = "test"; // имя команды
		this.desc = "desc"; // описание команды в общем списке команд
		this.advdesc = "advdesc"; // описание команды в помоще по конкретной команде
		this.args = "args"; // аргументы в общем списке команд
		this.argsdesc = "argsdesc"; // описание аргументов в помоще по конкретной команде
		this.advargs = "advargs"; // аргументы в помоще по конкретной команде
    }

    run(nek, client, msg, args){
		let embed = new Discord.EmbedBuilder() // составляем embed
			.setTitle('тесто') // заголовок
			.setColor(nek.config.basecolor) // цвет
		msg.reply({ embeds: [embed] }); // отправить
		return;
	}
	
}

module.exports = Test;

