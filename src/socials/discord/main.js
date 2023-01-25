const Discord = require('discord.js');
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent], partials: [Discord.Partials.Channel]}); // создание пользователя с правами

	
class Main {
	constructor(nek, config){
		//задать полученые значения для дальнейшего использования в коде команды
		this.nek = nek;
        this.config = config;
		
		this.desc = "Основной модуль соцсети Discord для входа в Discord и обработки сообщений, кнопок, команд и иных событий."
    }
	
    startup(nek, config){ // исполняется единожды при запуске
		nek.log('SOCIAL', 'There is no startup scripts!')
		return 'done';
	}
	
	work(nek, config){ // основная функция
		nek.log('SOCIAL', 'Logging in...')
		client.login(config.token_discord)
		
		client.on("messageCreate", async msg => {
			if (content.toLowerCase() == "test") {
				
			}
		})
		
		client.once('ready', () => {
			nek.log("SOCAIL", "Logged in"); // уведомляем об успешном входе
			if (nek.debug) { // если дебаг
				client.user.setStatus('idle'); // статус не беспокоить
				client.user.setActivity('debug'); // играет в дебаг
			} else { // если всё нормально
				client.user.setStatus('online'); // статус в сети
				client.user.setActivity(values.prefix + 'help'); // играет в <prefix>help
			};
			//nek.log("INFO", `Total launch time: ${((Date.now() - launch_time) / 1000 )}s`);
			nek.log("SOCIAL", `${client.user.username} (ver: ${nek.version}) is ready to work!`);
		});
	}
	
	
}

module.exports = Main