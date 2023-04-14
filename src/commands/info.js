const Discord = require("discord.js");
const os = require("os");

class Info {
    constructor(nek){
		this.version = "dev";
		
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
		function baseinfo(){
			let embed = new Discord.EmbedBuilder()
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
			return;
		}
		
		function debuginfo(){
			let embed = new Discord.EmbedBuilder()
			embed.setTitle('Дебаг инфа о боте')
			embed.setColor(nek.basecolor)
			embed.setDescription('пока тут много чего нету, ибо делаю')
				
			embed.addFields({
				name: 'Версии',
				value: '```\n' +
				'Node.js®: ' + process.version + '\n' +
				'Discord.js: ' + Discord.version + '\n' +
				'Загрузчик ' + nek.name + ': ' + nek.version + '\n' +
				
				
				
				'```'
			})
			embed.addFields({
				name: 'Система',
				value: '```\n' +
				'platform: ' + os.platform() + '\n' +
				'Используемая ОЗУ: ' + Math.round(process.memoryUsage().rss / 1048576) + ' МБ\n' +
				
				
				'```'
			})
			embed.addFields({
				name: 'Discord',
				value: '```\n' +
				'Кол-во серверов: ' + client.guilds.cache.size + '\n' +
				
				
				'```'
			})
			msg.reply({ embeds: [embed] });
			return;
		}
		
		if (args[1]?.toLowerCase() === "--debug") {
			debuginfo();
		} else {
			baseinfo();
		}
		return;
	}
	
}

module.exports = Info

