class Test {
    constructor(nek, config){
		
		//задать полученые значения для дальнейшего использования в коде команды
		//this.nek = nek;
        //this.config = config;
		
		this.category = "utility"; // категория команд
		this.hidden = false; // можно ли отображать команду в общем списке
		
		this.perms = [];
        this.name = "settings"; // имя команды
		this.desc = "настройки юзера"; // описание команды в общем списке команд
		this.advdesc = "Кастомизация под себя"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = ""; // описание аргументов в помоще по конкретной команде
		this.advargs = ""; // аргументы в помоще по конкретной команде
    }

    run(nek, client, msg, args){
		if (!args) {
			msg.reply({embed: ""}, msg)
		} else {
			msg.reply("тест simple text output", msg)
		}
	}
	
}

module.exports = Test

