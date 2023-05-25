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
	
	// Фатальная ошибка
	// - Идет окончание всех работ и последующее завершение процесса
	// - Пользователю отправляется id его сообщения, краткое описание ошибки и профиль разработчика
	// - Разработчику отправляется полный лог события
	async fatalError(nek, client, msg, error){ // error - стандартный global object Error
		
	}
	
}

module.exports = Logger;

