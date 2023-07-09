const Discord = require("discord.js");
const os = require("os");

class Info {
    constructor(nek){
		this.version = "1.1.1";
		
		this.category = "info"; // категория команд
		this.hidden = false; // можно ли отображать команду в общем списке
		
		this.perms = ["EMBED_LINKS"];
        this.name = "info"; // имя команды
		this.desc = "информация"; // описание команды в общем списке команд
		this.advdesc = "Информация о боте"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = "<-a> - информация для разработчика"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<аргумент>"; // аргументы в помоще по конкретной команде
    }

    run(nek, client, msg, args){
		function baseinfo(){
			let devstring = "";
			nek.config.developers.forEach(id => {
				devstring += '<@' + id + '>, ';
			});
			devstring = devstring.substring(0, devstring.length - 2);

			let thxstring = ""
			nek.config.thanks.forEach(id => {
				thxstring += '<@' + id + '>, ';
			});
			thxstring = thxstring.substring(0, thxstring.length - 2);
			
			const embed = new Discord.EmbedBuilder()
				.setTitle('Информация о боте')
				.setColor(nek.config.basecolor)
				.setDescription(nek.config.info + '\n\nРазработчики: ' + devstring + '\nБлагодарности: ' + thxstring);
			msg.reply({ embeds: [embed] });
			return;
		}
		
		function debuginfo(){
			const embed = new Discord.EmbedBuilder()
				.setTitle('Отладочная информация')
				.setColor(nek.config.basecolor)
				.addFields({
					name: 'Версии',
					value: '```\n' +
					'Node.js®: ' + process.version + '\n' +
					'Discord.js: ' + Discord.version + '\n' +
					'Загрузчик ' + nek.config.name + ': ' + nek.config.version + '\n' +
					'Скрипт соц. сети: ' + client.version + '\n' +
					'```'
				})
				.addFields({
					name: 'Ресурсы',
					value: '```\n' +
					'Тип ОС: ' + os.platform() + '\n' +
					'Используемая ОЗУ: ' + Math.round(process.memoryUsage().rss / 1048576) + ' МБ / ' + Math.round(process.memoryUsage().rss / 1024) + ' КБ\n' +
					'```'
				})
				.addFields({
					name: 'Статистика',
					value: '```\n' +
					'Старт: ' + new Date(nek.launchTime).toString() + '\n' +
					'Логин: ' + new Date(nek.loginTime).toString() + '\n' +
					'Время запуска: ' + ((nek.loginTime - nek.launchTime) / 1000) + ' секунд\n' +
					//'Время работы: ' + '\n' + сложна
					'Ошибки: ' + nek.errorsCount + '\n' +
					'```'
				})
				.addFields({
					name: 'Discord',
					value: '```\n' +
					'Сервера: ' + client.guilds.cache.size + '\n' +
					'Имя: ' + client.user.username + '#' + client.user.discriminator +'\n' +
					'```'
				});
				//.setFooter({text: 'Все даты указаны в часовом поясе GMT+3 (Москва)'});
			msg.reply({ embeds: [embed] });
			return;
		}
		
		if (args[1]?.toLowerCase() === "-a") {
			debuginfo();
		} else {
			baseinfo();
		}
		return;
	}
	
}

module.exports = Info;

