const Discord = require("discord.js");
class Help {
    constructor(nek){
		this.version = "dev";
		
		//задать полученые значения для дальнейшего использования в коде команды
		this.category = "info"; // категория команд
		this.hidden = false; // можно ли отображать команду в общем списке

		this.perms = [];
        this.name = "help"; // имя команды
		this.desc = "список команд"; // описание команды в общем списке команд
		this.advdesc = "Вывод полного перечня доступных для исполнения команд"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = "<команда> - команда, по которой надо получить информацию"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<команда>"; // аргументы в помоще по конкретной команде
		
    }
	
    run(nek, client, msg, args){
		if (args[1]) { // если нужна помощь по команде
			this.commHelp(nek, msg, args[1])
			return;
		}
		
		let cmds = {};
		nek.commands.forEach(cmd => { // смотрим все команды
			if (!cmds[cmd.category]) { // проверяем видели ли мы уже эту категорию
				cmds[cmd.category] = []; // если нет, то создать пустую строку чтоб undefined не было
			}
			if (!cmd.hidden || msg.author.id === nek.config.developers[0]) { // если команда не скрытая или автор разраб
				if (!cmd.version) {
					cmds[cmd.category].push("||`" + cmd.name + "`||"); // пихаем название команды в категорию
				} else {
					cmds[cmd.category].push("`" + cmd.name + "`"); // пихаем название команды в категорию
				}
			}
			
		});
		let embed = new Discord.EmbedBuilder() // составляем embed
			.setTitle('Список команд') // заголовок
			.setColor(nek.config.basecolor) // цвет
		for (const cat in cmds) { // смотрим все категории
			if (cmds[cat][0]) { // если в категории есть команды
				embed.addFields({ // добавляем field
					name: "**" + cat + "**", // название категории
					value: cmds[cat].join(', ') // команды в категории через запятую
				})
			}
		}
		embed.setFooter({text: 'Команды, которые могут работать нестабильно, скрыты за спойлером'})
		msg.reply({ embeds: [embed] }); // отправить
    }
	
	commHelp(nek, msg, name){
		const comm = nek.commands.get(name); // получаем команду из мапы
		if (!comm) {
			let embed = new Discord.EmbedBuilder() // составляем embed
				.setTitle('Команда не найдена') // заголовок
				.setColor(nek.config.errorcolor) // цвет
			msg.reply({ embeds: [embed] }); // отправить
			return;
		}
		let embed = new Discord.EmbedBuilder() // составляем embed
			.setTitle('Команда ' + comm.name) // заголовок
			.setColor(nek.config.basecolor) // цвет
			.setDescription('Скоро...')
		msg.reply({ embeds: [embed] }); // отправить
		return;
	}
}

module.exports = Help;

