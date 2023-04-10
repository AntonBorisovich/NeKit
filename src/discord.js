const Discord = require("discord.js");
const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.DirectMessages,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent
	],
	partials: [Discord.Partials.Channel]
});

class discord {
    constructor(nek){
		this.name = "discord";
		this.version = "dev";
    }

    async start(nek){ // нормальная работа
		// ВХОД
		try {
			nek.log("DISCORD", "Logging in...", "cyan");
			client.login(nek.config["token_" + this.name]); // логинимся в дискорд
		} catch(e) {
			nek.log("ERROR", "Failed to login!", "red"); // сообщаем, что всё всё пошло по жопе
			console.error(e); // вывод полной ошибки
			process.exit(1); // закрываем бота
		}
		client.once(Discord.Events.ClientReady, async () => { // когда залогинились
			nek.log("DISCORD", "Logged in as " + client.user.tag, 'cyan'); // логируем что залогинились
			nek.log("READY", `Total launch time: ${((Date.now() - nek.launch_time) / 1000 )}s`);
			client.user.setStatus('online'); // статус невидимки
			client.user.setActivity(nek.config.prefix + 'help'); // играет в <prefix>help
			let embed = new Discord.EmbedBuilder() // составляем embed
				.setTitle('Logged in')
				.setColor(nek.config.basecolor)
				.setDescription(nek.fullname + " is ready to work!\n\nBootloader ver: `" + nek.version + "`\nDiscord ver: `" + this.version + "`")
				.setTimestamp()
			const botowner = await client.users.fetch(nek.config.developers[0]); // ищем разработчика по id
			await botowner.send({ embeds: [embed] }); // отправляем разрабу
		})
		
		// СООБЩЕНИЯ
		async function messageHandler(msg){
			if (msg.author.bot) return; // игнор бота
			//if (nek.config.debug && !bot.settings.developerIDs.includes(userID)) return; 
			msg.content = msg.content.trim(); // очистка лишних пробелов
			
			if (msg.content.substring(0, nek.config.prefix.length).toLowerCase() !== nek.config.prefix) { // проверка префикса
				return;
			}
			
			if (msg.channel.type === "DM") { // личка
				nek.log('MESSAGE', 'Got direct message. DM is not supported now', 'gray');
				return;
			}
			;
			const args = msg.content.split(" "); // разделяем всё сообщение на слова
			const commName = args[0].slice(nek.config.prefix.length); // Отделяем префикс от названия команды
			const comm = nek.commands.get(commName); // получаем команду из мапы
			comm.run(nek, client, msg, args)
			
			if (!comm) {
				let embed = new Discord.EmbedBuilder() // составляем embed
					.setTitle('Ва?')
					.setColor(nek.config.basecolor)
					.setDescription("Нет такой команды чел")
					.setTimestamp()
				msg.reply({ embeds: [embed] });
				return;
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
	
	
	async logErrors(nek, totalErrors){ // лог ошибки (totalErrors) в лс первому разработчику, указанному в config.json
	
		// ВХОД
		try {
			nek.log("DISCORD", "Logging in...", "cyan");
			client.login(nek.config["token_" + this.name]); // логинимся в дискорд
		} catch(e) {
			nek.log("ERROR", "Failed to login!", "red"); // сообщаем, что всё всё пошло по жопе
			console.error(e); // вывод полной ошибки
			process.exit(1); // закрываем бота
		}
		
		// КОГДА ВОШЛИ
		client.once(Discord.Events.ClientReady, async () => { // когда залогинились
			try {
				client.user.setStatus('invisible'); // статус невидимки
				nek.log("DISCORD", "Logged in as " + client.user.tag, "cyan"); // логируем что залогинились

				let embed = new Discord.EmbedBuilder() // составляем embed
					.setTitle('Bootloader Error')
					.setColor('#FF0000')
					.setDescription('Got errors while loading:\n```' + totalErrors.join('\n\n') + '```')
					.setTimestamp()

				const botowner = await client.users.fetch(nek.config.developers[0]); // ищем разработчика по id
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

