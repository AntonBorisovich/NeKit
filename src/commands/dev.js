class Dev {
    constructor(nek, config){
		
		//задать полученые значения для дальнейшего использования в коде команды
		//this.nek = nek;
        //this.config = config;
		
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
		switch(args[1].toLowerCase()) {
			case 'reload':
				if (!args[2]) {
					console.log(nek)
					console.log(client)
					nek.restart(nek, client)
					return;
				}
				if (args[2].toLowerCase() === "commands" && args[2].toLowerCase() === "comms") {
					nek.restart('commands')
				}
				if (args[2].toLowerCase() === "functions" && args[2].toLowerCase() === "funcs") {
					nek.restart('functions')
				}	
				break;
		return;
		}
	}
	
}

module.exports = Dev

