//const Discord = require("discord.js");

class Help {
    constructor(nek, config){
		
		//задать полученые значения для дальнейшего использования в коде команды	
		this.perms = [""];
        this.name = "help"; // имя команды
		this.desc = "список команд"; // описание команды в общем списке команд
		this.advdesc = "Вывод полного перечня доступных для исполнения команд"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = "&ltкоманда&gt - команда, по которой надо получить информацию"; // описание аргументов в помоще по конкретной команде
		this.advargs = "&ltкоманда&gt"; // аргументы в помоще по конкретной команде
		this.version = "dev"
    }
	
    run(nek, msg, args){
		var Return = false;
		if (args[0]) { // если пользователь хочет подробнее о команде
			nek.commands.forEach(command => {
				if ( args[0].toLowerCase() == command.name.toLowerCase() ){
					if (command.argsdesc != "") {
						nek.send(nek.format(nek.prefix + command.name + " " + command.advargs + "\n\nОписание: ", 'bold') + command.advdesc + nek.format("\n\nАргументы: ", 'bold') + command.argsdesc, msg)
					} else {
						nek.send(nek.prefix + command.name + " " + command.advargs + "\n\nОписание: " + command.advdesc, msg)
					}
					Return = true;
				};
			});
		};
		
		if (Return) { return };
		
		const allcommands = nek.commands
		let pubcommands = nek.commands.slice(0)
		allcommands.forEach(command => { if ( command.desc.toLowerCase().endsWith('hide') ) { pubcommands.splice(pubcommands.indexOf(command), 1) } })
		let commando = pubcommands.map(comm => `${comm.name} ${comm.args} - ${comm.desc}\n`).join("");
		
		nek.send(commando.toString() + '\n' + nek.prefix + 'help &ltкоманда&gt для подробной информации по команде', msg)
    }
}

module.exports = Help

