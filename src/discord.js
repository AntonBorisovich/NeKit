const Discord = require("discord.js");
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent], partials: [Discord.Partials.Channel]});

class discord {
    constructor(nek, config){
		this.name = "discord";
		this.version = "dev";
    }
	
    async start(nek, config, funcs, comms){ // нормальная работа
	
		// ВХОД
		try {
			client.login(config["token_" + this.name]); // логинимся в дискорд
		} catch(e) {
			nek.log("ERROR", "Failed to login!", "red"); // сообщаем, что всё всё пошло по жопе
			console.error(e); // вывод полной ошибки
			process.exit(1); // закрываем бота
		}
		client.once(Discord.Events.ClientReady, async () => { // когда залогинились
			nek.log("DISCORD", "Logged in as " + client.user.tag, 'cyan'); // логируем что залогинились
			client.user.setStatus('online'); // статус невидимки
			client.user.setActivity(config.prefix + 'help'); // играет в <prefix>help
			let embed = new Discord.EmbedBuilder() // составляем embed
				.setTitle('Logged in!')
				.setColor(config.basecolor)
				.setDescription(nek.fullname + " (ver: " + nek.version + ") is ready to work!")
				.setTimestamp()
			const botowner = await client.users.fetch(config.developers[0]); // ищем разработчика по id
			await botowner.send({ embeds: [embed] }); // отправляем разрабу
		})
		
		// СООБЩЕНИЯ
		async function messageHandler(msg){
			nek.log('MESSAGE', 'Got message', 'gray');
			if (msg.author.id === config.developers[0] && msg.content === "ебучие") {
				msg.reply({content: 'пироги'});
			}
		}
		client.on(Discord.Events.MessageCreate, async (msg) => { // если новое сообщение в чате
			messageHandler(msg); // обработать
		})
		client.on(Discord.Events.MessageUpdate, async (oldmsg, newmsg) => { // если сообщение обновлено (edit)
			if (oldmsg.content.trim() !== newmsg.content.trim()) { // если сообщение не совпадает по содержанию со старым, то
				messageHandler(newmsg); // обработать
			}
		})
		
		// КНОПКИ, СПИСКИ, СЛЭЩ-КОМАНДЫ
		client.on(Discord.Events.InteractionCreate, async (inter) => {
				nek.log('INTERACTION', 'Got interaction. Interactions not supported now', 'gray');
				return;
				
				if (interaction.isChatInputCommand()) {
					nek.log('INTERACTION', 'Got slash interaction', 'gray');
					interaction.reply({ content: 'Слэш команды пока не поддерживаются! Используйте ' + values.prefix + 'help для вывода списка команд.', ephemeral: true});
					return;
				}
				if (!interaction.isButton() && !interaction.isStringSelectMenu()) { // если не кнопка и не список
					nek.log('INTERACTION', 'Got unknown interaction', 'gray');
					return;
				}
				const args = interaction.customId.split("_"); // получаем customid как массив
				//const msg = interaction.message;
				if (!interaction.customId) {
					nek.log('INTERACTION', 'customId not found', 'gray');
					return;
				}	
		})
    }
	
	
	async logErrors(nek, config, totalErrors){ // лог ошибки (totalErrors) в лс первому разработчику, указанному в config.json
		try {
			client.login(config["token_" + this.name]); // логинимся в дискорд
		} catch(e) {
			nek.log("ERROR", "Failed to login!", "red"); // сообщаем, что всё всё пошло по жопе
			console.error(e); // вывод полной ошибки
			process.exit(1); // закрываем бота
		}

		client.once(Discord.Events.ClientReady, async () => { // когда залогинились
			try {
				client.user.setStatus('invisible'); // статус невидимки
				nek.log("DISCORD", "Logged in as " + client.user.tag, "cyan"); // логируем что залогинились

				let embed = new Discord.EmbedBuilder() // составляем embed
					.setTitle('Bootloader Error')
					.setColor('#FF0000')
					.setDescription('Got errors while loading:\n```' + totalErrors.join('\n\n') + '```')
					.setTimestamp()

				const botowner = await client.users.fetch(config.developers[0]); // ищем разработчика по id
				await botowner.send({ embeds: [embed] }); // отправляем разрабу
				nek.log("DISCORD", "Sent! Logging out...", "cyan"); // сообщаем, что всё было отправлено
				await client.destroy(); // отключаемся от дискорда
				process.exit(1); // закрываем бота
			} catch(e) {
				nek.log("ERROR", "Failed to send report! Logging out...", "red"); // сообщаем, что всё всё пошло по жопе
				console.error(e);
				await client.destroy(); // отключаемся от дискорда
				process.exit(1); // закрываем бота
			}
		})
    }
	
	
	
}

module.exports = discord;

