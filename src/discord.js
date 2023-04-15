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

let works = new Map(); // мапа, где хрянятся все команды, которые всё ещё обрабатываются
let ignoreNewMsg = false; // если true, то новые команды не будут исполнятся

class discord {
    constructor(nek){
		this.name = "discord";
		this.version = "dev";
    }

    async start(nek){ // нормальная работа
		process.on('uncaughtException', function (err) {
			nek.log('ERROR', 'Got uncaught error! Check log below:', 'red');
			console.error(err);
		});
		
		nek.reconnect = () => { // функция переподключения
			nek.log('DISCORD', 'Reconnecting...', 'cyan')
			if (works.size !== 0) { // если никто не юзает бота сейчас
				ignoreNewMsg = true; // запрещаем обращаться к боту
				client.user.setStatus('idle'); // статус не на месте
				client.user.setActivity('Переподключаюсь...'); // играет в Переподключаюсь...
				nek.log('DISCORD', 'Someone is using bot right now. Trying again in 5 seconds...', 'cyan')
				setTimeout(() => { // пробуем ещё раз через 5 секунд.
					nek.reconnect();
				}, 5000);
				return;
			}
			nek.log('DISCORD', 'Logging out...', 'cyan', true)
			client.destroy(); // выходим
			nek.simplelog('OK!', 'green')
			nek.log('DISCORD', 'Logging in...', 'cyan', true)
			client.login(nek.config["token_" + this.name]); // входим
			nek.simplelog('OK!', 'green')
			setTimeout(() => { // задаем статусы через 10 секунд ибо discord moment
				ignoreNewMsg = false; // разрешаем обращаться к боту
				client.user.setStatus('online'); // статус невидимки
				client.user.setActivity(nek.config.prefix + 'help'); // играет в <prefix>help
			}, 10000);
			return;
		}
		
		// ВХОД
		try {
			nek.log("DISCORD", "Logging in...", "cyan", );
			client.login(nek.config["token_" + this.name]); // логинимся в дискорд
			//nek.config["token_" + this.name] = null;
		} catch(e) {
			nek.log("ERROR", "Failed to login!", "red"); // сообщаем, что всё всё пошло по жопе
			console.error(e); // вывод полной ошибки
			process.exit(1); // закрываем бота
		}
		
		client.once(Discord.Events.ClientReady, async () => { // когда залогинились
			nek.log("DISCORD", "Logged in as " + client.user.tag, "cyan"); // логируем что залогинились
			nek.log("READY", `Total launch time: ${((Date.now() - nek.launch_time) / 1000 )}s`);
			client.user.setStatus('online'); // статус невидимки
			client.user.setActivity(nek.config.prefix + 'help'); // играет в <prefix>help
			let embed = new Discord.EmbedBuilder() // составляем embed
				.setTitle('Logged in')
				.setColor(nek.config.basecolor)
				.setDescription(nek.fullname + " is ready to work!\n\nBootloader ver: `" + nek.version + "`\n" + this.name + " ver: `" + this.version + "`")
				.setTimestamp()
			const botowner = await client.users.fetch(nek.config.developers[0]); // ищем разработчика по id
			await botowner.send({ embeds: [embed] }); // отправляем разрабу
		})
		
		// СООБЩЕНИЯ
		async function messageHandler(msg){
			if (ignoreNewMsg) return; // если мы вырубаемся, то игнорим всех
			if (msg.author.bot) return; // игнор бота
			msg.content = msg.content.trim(); // очистка лишних пробелов
			
			if (msg.content.substring(0, nek.config.prefix.length).toLowerCase() !== nek.config.prefix) { // проверка префикса
				return;
			}

			const args = msg.content.split(" "); // разделяем всё сообщение на слова
			const commName = args[0].slice(nek.config.prefix.length); // Отделяем префикс от названия команды
			let comm = nek.commands.get(commName); // получаем команду из мапы
			
			if (!comm) { // если команда не найдена
				// let embed = new Discord.EmbedBuilder() // составляем embed
					// .setTitle('Ва?')
					// .setColor(nek.config.basecolor)
					// .setDescription("Нет такой команды чел")
				// msg.reply({ embeds: [embed] });
				return;
			}
			
			const startTime = Date.now();
			const permsFunc = nek.functions.get("perms"); // получаем функцию проверки прав
			
			if (args[args.length-1].toLowerCase() === "--help") { // если последний аргумент --help
				if (!permsFunc.checkPerms(nek, msg, ["SEND_MESSAGES", "EMBED_LINKS"])[0]) { // если можно отправить сообщение
					const helpComm = nek.commands.get("help");
					nek.log('MESSAGE', 'Executed  "' + helpComm.name + '" (' + msg.id + ')', 'gray');
					helpComm.commAdvHelp(nek, msg, comm.name);
					nek.log('MESSAGE', 'Done with "' + helpComm.name + '" (' + msg.id + ')', 'gray');
					return;
				} else {
					let embed = new Discord.EmbedBuilder()
						.setTitle('Нету нужных прав')
						.setColor(nek.config.errorcolor)
						.setDescription('Для вывода помощи по команде нужны права `SEND_MESSAGES, EMBED_LINKS`.\nСообщите об этом владельцу сервера!')
					msg.author.send({ embeds: [embed] });
					return;
				}
			}
			
			// проверка прав команды
			let SendMsgPerm = "SEND_MESSAGES";
			if (msg.channel.type === Discord.ChannelType.GuildForum || msg.channel.type === Discord.ChannelType.GuildPublicThread || msg.channel.type === Discord.ChannelType.GuildPrivateThread) {
				SendMsgPerm = "SEND_MESSAGES_IN_THREADS"; // если сообщение в ветке, то проверять можно ли отправлять сообщение в ветках
			}
			const failPerms = permsFunc.checkPerms(nek, msg, [SendMsgPerm, ...comm.perms]);
			if (failPerms[0]) { // если есть хоть одно отсутствующее право то стоп-кран
				nek.log('MESSAGE', 'Missing permission(s) [' + failPerms.join(', ') + '] for "' + comm.name + '" (' + msg.id + ')', 'gray')
				if (!permsFunc.checkPerms(nek, msg, [SendMsgPerm, "EMBED_LINKS"])[0]) { // если можно печатать с эмбедами, то отправить ошибку эмбедом
					let embed = new Discord.EmbedBuilder()
						.setTitle('Нету нужных прав')
						.setColor(nek.config.errorcolor)
						.setDescription('Для работы команды `' + comm.name + '` нужны следующие права: `' + failPerms.join(', ') + '`\n[Что значат эти буквы?](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)')
					msg.reply({ embeds: [embed] });
					return;
				} else if (!permsFunc.checkPerms(nek, msg, [SendMsgPerm])[0]) { // если вообще можно печатать, то отправить ошибку текстом
					msg.reply({content: '**ОШИБКА:**\nДля работы команды `' + comm.name + '` нужны следующие права: `' + failPerms.join(', ') + '`\nЧто значат эти буквы?: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags'});
					return;
				} else { // если нельзя печатать, то отправить ошибку в лс
					let embed = new Discord.EmbedBuilder()
						.setTitle('Нету нужных прав')
						.setColor(nek.config.errorcolor)
						.setDescription('Для работы команды `' + comm.name + '` нужны следующие права: `' + failPerms.join(', ') + '`\nСообщите об этом владельцу сервера!')
					msg.author.send({ embeds: [embed] });
					return;
				}
				return;
			}
			
			if (comm.TWOFA) { // если для запуска нужна двухфакторка
				nek.log('MESSAGE', 'Got 2FA command. Checking 2FA...', 'gray');
				const twofacomm = nek.commands.get('2fa')
				if (!twofacomm) { // проверяем есть ли вообще команда 2FA
					let embed = new Discord.EmbedBuilder()
						.setTitle('Команда 2FA не найдена!')
						.setColor(nek.config.errorcolor)
						.setDescription("Это невозможно, но команда 2FA не найдена. Вы не можете использовать 2FA команды")
					msg.reply({ embeds: [embed] });
					return;
				}

				const Pass2FA = await twofacomm.Check2FA(nek, args[args.length-1]);
				if (!Pass2FA) { // если получили отрицательный ответ
					nek.log('MESSAGE', 'Wrong 2FA code', 'gray');
					let embed = new Discord.EmbedBuilder()
						.setTitle('Неверный код')
						.setColor(nek.config.errorcolor)
						.setDescription("Код не подошёл или вы его не указали. Напишите ваш 2FA код в конце сообщения через пробел. Например `" + nek.config.prefix + comm.name + " 013370`")
					msg.reply({ embeds: [embed] });
					return;
				}
				if (Pass2FA === "no_secret") { // если нету секрета
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.errorcolor)
						.setDescription("Секрет не задан. Попробуйте создать его через `" + nek.config.prefix + "2fa create`")
					msg.reply({ embeds: [embed] });
					return;
				}
				args.pop() // удаляем код 2FA из аргументов после успешной проверки
			}
			
			works.set(msg.id, {name: comm.name, timestamp: startTime}) // запоминаем, что мы начали работу над этой командой
			nek.log('MESSAGE', 'Executed  "' + comm.name + '" (' + msg.id + ')', 'gray');
			await comm.run(nek, client, msg, args); // запускаем команду
			works.delete(msg.id); // удаляем, т.к. мы закончили работу
			nek.log('MESSAGE', 'Done with "' + comm.name + '" (' + msg.id + ') in ' + (Date.now() - startTime) + 'ms', 'gray');
		}
		client.on(Discord.Events.MessageCreate, async (msg) => { // если новое сообщение в чате
			messageHandler(msg); // обработать
		})
		client.on(Discord.Events.MessageUpdate, async (oldmsg, newmsg) => { // если сообщение обновлено (edit)
			if (oldmsg.content.trim() !== newmsg.content.trim()) { // если сообщение не совпадает по содержанию со старым, то
				messageHandler(newmsg); // обработать
			}
		})
		
		// КНОПКИ, СПИСКИ, СЛЭШ-КОМАНДЫ
		client.on(Discord.Events.InteractionCreate, async (interaction) => {
				nek.log('INTERACTION', 'Got interaction. Interactions not supported now', 'gray');
				interaction.reply({ content: 'Интерактивные элементы (кнопки, списки) пока не работают!', ephemeral: true});
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

