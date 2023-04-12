class Dev {
    constructor(nek){
		
		//задать полученые значения для дальнейшего использования в коде команды
		//this.nek = nek;
        //this.config = config;
		
		this.category = "utility"; // категория команд
		this.hidden = true; // можно ли отображать команду в общем списке
		this.TWOFA = false; // нужна двухфакторка для работы
		
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
				if (!args[2]) {
					reloadFunc.reload(nek, 'ALL', 'functions');
					msg.reply({content: 'перезагрузил все функции'});
					return;
				}
				reloadFunc.reload(nek, args[2], 'functions');
				msg.reply({content: 'перезагрузил функцию `' + args[2] + '`'});
				return;
		} else if (args[1] === 'reloadcomm') {
				const reloadFunc = nek.functions.get('reloader');
				if (!args[2]) {
					reloadFunc.reload(nek, 'ALL', 'commands');
					msg.reply({content: 'перезагрузил все команды'});
					return;
				};
				reloadFunc.reload(nek, args[2], 'commands');
				msg.reply({content: 'перезагрузил команду `' + args[2] + '`'})
				return;
		} else if (args[1] === 'reload') {
				const reloadFunc = nek.functions.get('reloader');
				reloadFunc.reload(nek, 'ALL', 'commands');
				reloadFunc.reload(nek, 'ALL', 'functions');
				msg.reply({content: 'перезагрузил вообще всё'});
				return;
		}
	}
	
}

module.exports = Dev

