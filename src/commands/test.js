class Test {
    constructor(nek, config){
		
		//задать полученые значения для дальнейшего использования в коде команды
		//this.nek = nek;
        //this.config = config;
		
		this.perms = ["image", "embed"];
        this.name = "test"; // имя команды
		this.desc = "тест desc"; // описание команды в общем списке команд
		this.advdesc = "тест advdesc"; // описание команды в помоще по конкретной команде
		this.args = "тест args"; // аргументы в общем списке команд
		this.argsdesc = "тест argsdesc"; // описание аргументов в помоще по конкретной команде
		this.advargs = "тест advargs"; // аргументы в помоще по конкретной команде
    }

    run(nek, msg, args){
		if (!args) {
			nek.send({embed: ""}, msg)
		} else {
			nek.send("тест simple text output", msg)
		}
	}
	
}

module.exports = Test

