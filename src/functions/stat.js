const Discord = require("discord.js");

class Stat {
    constructor(nek){
        this.name = "stat";
		this.version = "1.0";
    }
	
	// Ебать это говно. Переписывай давай на sqlite
	
	// Хранение статистики
	//
	// Файлы хранятся в src/stat/ и выглядят так:
	//  DD_MM_YY_stats.json - подробная статистика за день
	//  > {
	//  > 	"id": "id_сообщения",
	//  > 	"commmand": "название_команды",
	//  > 	"time": "timestamp_начала_исполнения_команды",
	//  > 	"timeSpent": "затраченное_время_в_мс",
	//  >	"error": "SyntaxError" (error.name если была ошибка. Для примера взят SyntaxError) / false (если всё ок)
	//  > 	...
	//  > 	
	//  > 	
	//  > 	
	//  > 	
	//  > 	
	//  > }
	//  global_stats.json   - краткая статистика за всё время работы
	//  > {
	//	>	"logins": 1337, (кол-во успешных входов в соц. сеть)
	//	>	"execs": 9999, (кол-во исполненных команд)
	//  >	"errors": 1, (кол-во ошибок)
	//  >	
	//  >	
	//  > }
	
	// Запись статистики
	//
	// ВХОД:
	//  nek - nek
	//  client - client
	//  msg - msg или interaction
	//  work - объект из массива works (опционально)
	//
	//  Если дан реальный msg или interaction то происходит запись слудющих данных:
	//  - id сообщения
	//  - запущенная команда
	//  - время, затраченное на выполнение команды
	//  - 
	//  - 
	//  
    writeStat(nek, client, msg, work){ 
		
		
	}
	
	
	loginStat(nek, client){ 
		
		
	}
}

module.exports = Stat;

