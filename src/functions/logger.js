const Discord = require("discord.js");

class Logger {
    constructor(nek){
        this.name = "logger";
		this.version = "dev"
    }
	
	// Объект message имеет следующую структуру
	// {
	//		title: "заголовок",
	//		message: "сообщение",
	//		color: "hex цвет",	
	// }
	
	// Кастомное сообщение разработчикам
	// -
	async devMsg(nek, client, message){ // message (string) - текст сообщения
		
	}
	
	// Обычная ошибка пользователя
	// - Работа бота продолжается
	// - Пользователю отправляется краткое описание его ошибки
	// - Никакие логи не отправляются разработчику
    async userError(nek, client, msg, message){
		
	}
	
	// Ошибка кода
	// - Работа бота продолжается
	// - Пользователю отправляется id его сообщения, краткое описание ошибки и профиль разработчика
	// - Разработчику отправляется полный лог события
	async codeError(nek, client, msg, error){ // error - стандартный global object Error
		
	}
	
	// Неизвестная ошибка
	// - Работа бота продолжается
	// - Разработчику отправляется полный лог события
	async uncaughtError(nek, client, error){ // error - стандартный global object Error
		nek.log("ERROR", "Got uncaught error!", "red");
		console.error(error);
		nek.log("LOGGER", "Sending report...", "gray", true);
		try {
			const botowner = await client.users.fetch(nek.config.developers[0]);
			let embed = new Discord.EmbedBuilder()
				.setTitle(':x: Uncaught error!')
				.setColor(nek.config.errorcolor)
				.setDescription('```\n' + error.name + ": " + error.message + "\n>" + error.stack.slice(0, error.stack.indexOf('\n')) + '\n```')
				.setTimestamp()
			await botowner.send({ embeds: [embed] });
		} catch(e) {
			nek.simplelog("ERR!", "red");
			nek.log("LOGGER","Failed to send report!", "red");
			console.error(e)
			return;
		}
		nek.simplelog("SENT!", "green");
		return;
	}
	
	// Фатальная ошибка
	// - Идет окончание всех работ и последующее завершение процесса
	// - Пользователю отправляется id его сообщения, краткое описание ошибки и профиль разработчика
	// - Разработчику отправляется полный лог события
	async fatalError(nek, client, msg, error){ // error - стандартный global object Error
		
	}
	
}

module.exports = Logger;

