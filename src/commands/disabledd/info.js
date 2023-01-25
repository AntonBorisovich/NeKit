class Info {
    constructor(nek, config){
		
		//задать полученые значения для дальнейшего использования в коде команды
		this.nek = nek;
        this.config = config;
		
		this.perms = [""];
        this.name = "info"; // имя команды
		this.desc = "информация"; // описание команды в общем списке команд
		this.advdesc = "Информация о боте"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = ""; // описание аргументов в помоще по конкретной команде
		this.advargs = ""; // аргументы в помоще по конкретной команде
    }

    run(nek, msg, config){
		
		let embed = new Discord.EmbedBuilder()
		embed.setTitle(kitsune.user.username + ' - ' + this.name)
		embed.setColor(`#F36B00`)
		embed.setDescription('test')
		embed.setFooter({ text: 'Версия бота: ' + this.values.version + "\nВерсия node: " + process.version + "\nВерсия Discord.js: v14" });
		msg.reply({ embeds: [embed], components: [row] });
		
		nek.send({
			'block': 'custom', // custom content
			'embed': true, // use embed if available
			'color': false, // color from config
			'title': false, // default title (nickname + command name)
			'content1': 'testing', // main text
			'content2': 'Версия бота: ' + nek.version  // additional text
		}, msg)
	}
	
}

module.exports = Info

