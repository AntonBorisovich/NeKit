class Test {
    constructor(nek, config){
		
		//задать полученые значения для дальнейшего использования в коде команды
		//this.nek = nek;
        //this.config = config;
		
		this.category = "test"; // категория команд
		this.hidden = false; // можно ли отображать команду в общем списке
		
		this.perms = ["image", "embed"];
        this.name = "test"; // имя команды
		this.desc = "тест desc"; // описание команды в общем списке команд
		this.advdesc = "тест advdesc"; // описание команды в помоще по конкретной команде
		this.args = "тест args"; // аргументы в общем списке команд
		this.argsdesc = "тест argsdesc"; // описание аргументов в помоще по конкретной команде
		this.advargs = "тест advargs"; // аргументы в помоще по конкретной команде
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

