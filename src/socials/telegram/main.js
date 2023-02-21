const { Telegraf } = require('telegraf');

class Main {
	constructor(nek, config){
		this.desc = "Основной модуль соцсети Telegram для входа в Telegram и обработки сообщений, кнопок, команд и иных событий.";
    };
	
    autorun(nek, config){ // исполняется единожды при запуске
		//nek.log('SOCIAL', 'There is no autorun needed!');
		return 'done';
	};
	
	async work(nek, config){ // основная функция
		nek.log('TELEGRAM', 'Connecting to servers...', 'blue', true);
		const client = new Telegraf(config.token_telegram); // задаём токен
		try {
			client.botInfo = await client.telegram.getMe(); // получаем информацию о профиле бота в телеге
			nek.simplelog("CONNECTED!", 'green');
		} catch(e) { // если ошибка
			nek.simplelog("ERR!", 'red');
			nek.log('ERROR', 'An error has accoured during connecting to Telegram', 'red');
			console.error(e);
			process.exit(1);
		};
		try {
			nek.log('INFO', 'Total launch time: ' + ((Date.now() - nek.launch_time) / 1000 ) + 's');
			nek.log('TELEGRAM', client.botInfo.first_name + ' [@' + client.botInfo.username + '] (ver: ' + nek.version + ') is ready to work!', 'blue');
			client.launch(); // начинаем работу
			nek.telegram = client.telegram
		} catch(e) {
			console.error(e);
			process.exit(1);
		}
		
		client.start((msg) => {
			nek.send('Напиши ' + nek.prefix + 'help или /help для ознакомления с функционалом бота!', msg);
		});
		client.help((msg) => {
			let executed = false
			console.log(msg)
			nek.commands.forEach(command => {
				if (command.name == "help") {
					executed = true;
					let args = msg.update.message.text.split(" "); // форматируем аргументы
					args.shift(); // обрезаем первый аргумент т.к. это имя команды
					nek.log('TELEGRAM', 'Executed command help', 'blue');
					command.run(nek, msg, args);
				};
			});
			if (!executed) {
				nek.send('Команда /help не найдена. Попробуйте позже.');
				return;
			};
		});
		client.on("message", async msg => { // обрабатываем сообщения
			let args
			if (msg.update.message.caption) {
				args = msg.update.message.caption.split(" ");
			} else if (msg.update.message.text) {
				args = msg.update.message.text.split(" ");
			} else {
				args = false;
			};
			if (args[0].toLowerCase().startsWith(nek.prefix)) {
				const cmd = args[0].substring(nek.prefix.length) // получаем имя вызываемой команды из сообщения
				args.shift() // обрезаем первый аргумент т.к. это имя команды
				nek.commands.forEach(command => { // перебираем список команд в боте
					if (command.name == cmd.toLowerCase()) { // если команда в сообщении совпала с командой из списка бота то работать	
						try {
							nek.log('DISCORD','Executed command ' + command.name, 'blue'); // логирование о проходе всех проверок и начале запуске команды
							command.run(nek, msg, args); // запуск команды
						} catch (error) { // если ошибка то логировать ошибку
							console.error(error)
						};
					}
				});
			}
			
			
		});
	};
	
	
};

module.exports = Main