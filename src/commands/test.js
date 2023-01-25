class Test {
    constructor(nek, config){
		
		//задать полученые значения для дальнейшего использования в коде команды
		this.nek = nek;
        this.config = config;
		
		this.perms = [""];
        this.name = "test"; // имя команды
		this.desc = "тест desc"; // описание команды в общем списке команд
		this.advdesc = "тест advdesc"; // описание команды в помоще по конкретной команде
		this.args = "тест args"; // аргументы в общем списке команд
		this.argsdesc = "тест argsdesc"; // описание аргументов в помоще по конкретной команде
		this.advargs = "тест advargs"; // аргументы в помоще по конкретной команде
    }

    run(nek, config, msg, args){
		if (!args) {
			nek.send({
				'block': 'custom', // custom content
				'embed': true, // use embed if available
				'color': false, // color from config
				'title': false, // default title (nickname + command name)
				'content1': 'testing', // main text
				'content2': 'Версия бота: ' + nek.version  // additional text
			}, msg)
		} else {
			nek.send("тест simple text output", msg)
		}
	}
	
}

module.exports = Test

