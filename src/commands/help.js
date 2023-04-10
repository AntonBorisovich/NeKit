const { EmbedBuilder } = require("discord.js");

class Help {
    constructor(nek, config){
		
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
		this.version = "dev"
    }
	
    run(nek, client, msg, args){	
		let cmds = {};
		nek.commands.forEach(cmd => { // смотрим все команды
			if (!cmds[cmd.category]) { // проверяем видели ли мы уже эту категорию
				cmds[cmd.category] = []; // если нет, то создать пустую строку чтоб undefined не было
			}
			cmds[cmd.category].push("`" + cmd.name + "`"); // пихаем название команды в категорию
		});
		let embed = new EmbedBuilder() // составляем embed
			.setTitle('Список команд') // заголовок
			.setColor(nek.config.basecolor) // цвет
		for (const cat in cmds) { // смотрим все категории
			embed.addFields({ // добавляем field
				name: "**" + cat + "**", // название категории
				value: cmds[cat].join(', ') // команды в категории через запятую
			})
		}
		
		msg.reply({ embeds: [embed] }); // отправить
    }
}

module.exports = Help

