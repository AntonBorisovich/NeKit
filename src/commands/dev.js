const Discord = require("discord.js");

class Dev {
    constructor(nek){
		this.version = "dev";
		
		this.category = "utility"; // категория команд
		this.hidden = true; // можно ли отображать команду в общем списке
		this.TWOFA = true; // нужна двухфакторка для работы
		
		this.perms = [];
        this.name = "dev"; // имя команды
		this.desc = "отладка"; // описание команды в общем списке команд
		this.advdesc = "отладка и разработка"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = ""; // описание аргументов в помоще по конкретной команде
		this.advargs = ""; // аргументы в помоще по конкретной команде
    }

    run(nek, client, msg, args){
		if (!args[1]) {
			msg.reply({content: 'агде'})
			return;
		}
		if (args[1] === 'reloadfunc') {
				const reloadFunc = nek.functions.get('reloader');
				let outputString = "";
				if (!args[2]) { // если ничего не указано, то надо перезагрузить всё
					for (const key of Array.from( nek.functions.keys() )) { // чекаем каждую команду в мапе
						const reloadResult = reloadFunc.reload(nek, key, 'functions'); // перезагружаем команду
						outputString += key + " - " + reloadResult + "\n"; // пишем будущий лог
					}
					let embed = new Discord.EmbedBuilder() // составляем embed
						.setTitle('Функции перезагружены') // заголовок
						.setColor(nek.config.basecolor) // цвет
						.setDescription('```\n' + outputString + '```')
					msg.reply({ embeds: [embed] }); // отправить
					return;
				}
				
				// если указаны аргументы, то преобразовать их в массив и перезагрузить каждую
				args.shift() // режем первое знач. массива
				args.shift() // режем второе знач. массива
				for (const func of args ) { // чекаем каждую команду в мапе
					const reloadResult = reloadFunc.reload(nek, func.toLowerCase(), 'functions'); // перезагружаем команду
					outputString += func.toLowerCase() + " - " + reloadResult + "\n"; // пишем будущий лог
				}
				let embed = new Discord.EmbedBuilder() // составляем embed
					.setTitle('Функции перезагружены') // заголовок
					.setColor(nek.config.basecolor) // цвет
					.setDescription('```\n' + outputString + '```')
				msg.reply({ embeds: [embed] }); // отправить
				return;
		} else if (args[1] === 'reloadcomm') {
				const reloadFunc = nek.functions.get('reloader');
				let outputString = "";
				if (!args[2]) { // если ничего не указано, то надо перезагрузить всё
					for (const key of Array.from( nek.commands.keys() )) { // чекаем каждую команду в мапе
						const reloadResult = reloadFunc.reload(nek, key, 'commands'); // перезагружаем команду
						outputString += key + " - " + reloadResult + "\n"; // пишем будущий лог
					}
					let embed = new Discord.EmbedBuilder() // составляем embed
						.setTitle('Команды перезагружены') // заголовок
						.setColor(nek.config.basecolor) // цвет
						.setDescription('```\n' + outputString + '```')
					msg.reply({ embeds: [embed] }); // отправить
					return;
				}
				
				// если указаны аргументы, то преобразовать их в массив и перезагрузить каждую
				args.shift() // режем первое знач. массива
				args.shift() // режем второе знач. массива
				for (const comm of args ) { // чекаем каждую команду в мапе
					const reloadResult = reloadFunc.reload(nek, comm.toLowerCase(), 'commands'); // перезагружаем команду
					outputString += comm.toLowerCase() + " - " + reloadResult + "\n"; // пишем будущий лог
				}
				let embed = new Discord.EmbedBuilder() // составляем embed
					.setTitle('Команды перезагружены') // заголовок
					.setColor(nek.config.basecolor) // цвет
					.setDescription('```\n' + outputString + '```')
				msg.reply({ embeds: [embed] }); // отправить
				return;
		} else if (args[1] === 'reload') { // перезагрузить вообще всё
				const reloadFunc = nek.functions.get('reloader');
				let outputString = "Команды:\n";
				for (const key of Array.from( nek.commands.keys() )) { // чекаем каждую команду в мапе
					const reloadResult = reloadFunc.reload(nek, key, 'commands'); // перезагружаем команду
					outputString += key + " - " + reloadResult + "\n"; // пишем будущий лог
				}
				outputString += "\nФункции:\n";
				for (const key of Array.from( nek.functions.keys() )) { // чекаем каждую функцию в мапе
					const reloadResult = reloadFunc.reload(nek, key, 'functions'); // перезагружаем функцию
					outputString += key + " - " + reloadResult + "\n"; // пишем будущий лог
				}
				let embed = new Discord.EmbedBuilder() // составляем embed
					.setTitle('Всё перезагружено') // заголовок
					.setColor(nek.config.basecolor) // цвет
					.setDescription('```\n' + outputString + '```')
				msg.reply({ embeds: [embed] }); // отправить
				return;
		} else if (args[1] === 'reconnect') {
			let embed = new Discord.EmbedBuilder() // составляем embed
				.setTitle('пока-пока') // заголовок
				.setColor(nek.config.basecolor) // цвет
				.setDescription('Идем на реконнект...')
			msg.reply({ embeds: [embed] }); // отправить
			nek.reconnect(); // реконнектим
			return;
		} else {
			let embed = new Discord.EmbedBuilder() // составляем embed
				.setTitle('Чего') // заголовок
				.setColor(nek.config.errorcolor) // цвет
				.setDescription('Неизвестная операция')
			msg.reply({ embeds: [embed] }); // отправить
		}
	}
	
}

module.exports = Dev

