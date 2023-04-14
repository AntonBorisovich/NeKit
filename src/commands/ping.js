const Discord = require("discord.js");

class Ping {
    constructor(nek){
		//задать полученые значения для дальнейшего использования в коде команды
		this.version = "v1";
		
		this.perms = [""];
		this.category = "utility";
		this.args = "";
		this.advargs = "";
		this.usage = "";
        this.desc = "пинг бота";
        this.advdesc = "Проверка соединения бота с дискордами (пинг)";
        this.name = "ping";
    }

    run(nek, client, msg, args){
		try {
			const ping = Math.round(client.ws.ping);
			if (ping) {
				let embed = new Discord.EmbedBuilder()
					.setTitle('Пинг')
					.setColor(nek.config.basecolor)
					.setDescription("Понг! (" + ping + " мс)")
				msg.reply({ embeds: [embed] });
				return;
			} else {
				let embed = new Discord.EmbedBuilder()
					.setTitle('Пинг')
					.setColor(nek.config.errorcolor)
					.setDescription("Нет пинга?")
				msg.reply({ embeds: [embed] });
				return;
			}
		} catch(err) {
			console.error(err);
			let embed = new Discord.EmbedBuilder()
				.setTitle('Ошибка')
				.setColor(nek.config.errorcolor)
				.setDescription("Не удалось вычислить задержку")
			msg.reply({ embeds: [embed] });
			return;
		}
    }
}

module.exports = Ping;

