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
let timeouts = new Map(); // мапа, где хрянятся пользователи с кулдауном
let ignoreNewMsg = false; // если true, то новые команды не будут исполнятся

class discord {
    constructor(nek){
		this.name = "discord";
		this.version = "dev";
    }
	
    async start(nek){ // ОБЫЧНОЕ НАЧАЛО РАБОТЫ
		const permsFunc = nek.functions.get("perms"); // получаем функцию проверки прав, она будет использоватся далее
		
		process.on('uncaughtException', function (err) {
			nek.log('ERROR', 'Got uncaught error! Check log below:', 'red');
			console.error(err);
		});
		
		// ФУНКЦИЯ ПЕРЕПОДКЛЮЧЕНИЯ
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
				if (!nek.config.noActivity) {
					client.user.setStatus('online'); // статус невидимки
					client.user.setActivity(nek.config.prefix + 'help'); // играет в <prefix>help
				}
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
		
		
		// ПОСЛЕ ВХОДА
		client.once(Discord.Events.ClientReady, async () => { // когда залогинились
			nek.log("DISCORD", "Logged in as " + client.user.tag, "cyan"); // залогинились как *имя пользователя*
			nek.log("READY", `Total launch time: ${((Date.now() - nek.launch_time) / 1000 )}s`); // логируем что залогинились за n секунд с запуска бота
			if (!nek.config.noActivity) {
				client.user.setStatus('online'); // статус невидимки
				client.user.setActivity(nek.config.prefix + 'help'); // играет в <prefix>help
			}
			
			// Делаем сообщение разрабам
			let embed = new Discord.EmbedBuilder()
				.setTitle('Logged in')
				.setColor(nek.config.basecolor)
				.setDescription(nek.fullname + " is ready to work!\n\nBootloader ver: `" + nek.version + "`\n" + this.name + " ver: `" + this.version + "`")
				.setTimestamp()
			const botowner = await client.users.fetch(nek.config.developers[0]); // ищем разработчика по id
			await botowner.send({ embeds: [embed] }); // отправляем разрабу
		});
		
		// СООБЩЕНИЯ
		async function messageHandler(msg){
			if (ignoreNewMsg) return; // если сказано игнорить - игнор
			if (msg.author.bot) return; // если бот - игнор
			
			msg.content = msg.content.trim(); // убираем лишние пробелы с начала и конца, что бы корректно найти префикс
			if (msg.content.substring(0, nek.config.prefix.length).toLowerCase() !== nek.config.prefix) return; // если не найден префикс - игнор

			let args = msg.content.split(" "); // разделяем всё сообщение на слова (через пробел)
			const commName = args[0].slice(nek.config.prefix.length); // выделяем название команды
			let comm = nek.commands.get(commName); // получаем команду из мапы
			
			if (!comm) return; // если такая команда не найдена - игнор
			
			// КОМАНДА НАЙДЕНА
			if (timeouts.get(msg.author.id)) { // если пользователь в списке тайм-аута, то игнор
				nek.log('MESSAGE', 'User is on cooldown. Ignoring', 'gray');
				return;
			}

			const startTime = Date.now(); // запоминаем когда начали работать над командой
			
			
			if (args[args.length-1].toLowerCase() === "--help") { // если последний аргумент - "--help"
				const helpComm = nek.commands.get("help"); // ищем команду help
				args = [nek.config.prefix + helpComm.name, comm.name]; // подменяем аргументы
				comm = helpComm; // подменяем исполняемую команду на help
			}
			
			let sendMsgPerm = "SEND_MESSAGES"; // проверять право, которое даст нам печатать в КАНАЛАХ
			if (msg.channel.type === Discord.ChannelType.GuildForum || msg.channel.type === Discord.ChannelType.GuildPublicThread || msg.channel.type === Discord.ChannelType.GuildPrivateThread) {
				sendMsgPerm = "SEND_MESSAGES_IN_THREADS"; // если сообщение в ветке, то проверять право, которое даст нам печатать в ВЕТКАХ
			}
			const missingPerms = permsFunc.checkPerms(nek, msg, [sendMsgPerm, ...comm.perms]); // проверяем права и запоминаем, какие отсутствуют
			if (missingPerms[0]) { // если есть хоть одно отсутствующее право, то информируем пользователя
				nek.log('MESSAGE', 'Missing permission(s) [' + missingPerms.join(', ') + '] for "' + comm.name + '" (' + msg.id + ')', 'gray');
				if (!permsFunc.checkPerms(nek, msg, [sendMsgPerm, "EMBED_LINKS"])[0]) { // если можно печатать с эмбедами, то отправить ошибку эмбедом
					let embed = new Discord.EmbedBuilder()
						.setTitle('Нету нужных прав')
						.setColor(nek.config.errorcolor)
						.setDescription('Для работы команды `' + comm.name + '` нужны следующие права: `' + missingPerms.join(', ') + '`\n[Что значат эти буквы?](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)')
					await msg.reply({ embeds: [embed] });
					return;
				} else if (!permsFunc.checkPerms(nek, msg, [sendMsgPerm])[0]) { // если вообще можно печатать, то отправить ошибку текстом
					await msg.reply({content: '**ОШИБКА:**\nДля работы команды `' + comm.name + '` нужны следующие права: `' + missingPerms.join(', ') + '`\nЧто значат эти буквы?: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags'});
					return;
				} else { // если нельзя печатать, то отправить ошибку в лс
					let embed = new Discord.EmbedBuilder()
						.setTitle('Нету нужных прав')
						.setColor(nek.config.errorcolor)
						.setDescription('Для работы команды `' + comm.name + '` нужны следующие права: `' + missingPerms.join(', ') + '`\nСообщите об этом владельцу сервера!')
					await msg.author.send({ embeds: [embed] });
					return;
				}
			}
			
			if (comm.TWOFA) { // если для запуска нужна двухфакторка, то проверить код
				nek.log('MESSAGE', 'Got 2FA command. Checking 2FA...', 'gray');
				const twofaComm = nek.commands.get('2fa');
				if (!twofaComm) { // проверяем есть ли вообще команда 2FA
					let embed = new Discord.EmbedBuilder()
						.setTitle('Команда 2FA не найдена!')
						.setColor(nek.config.errorcolor)
						.setDescription("Это невозможно, но команда 2FA не найдена. Вы не можете использовать 2FA команды")
					await msg.reply({ embeds: [embed] });
					return;
				}

				const Pass2FA = await twofaComm.Check2FA(nek, args[args.length-1]);
				if (!Pass2FA) { // если получили отрицательный ответ
					nek.log('MESSAGE', 'Wrong 2FA code', 'gray');
					let embed = new Discord.EmbedBuilder()
						.setTitle('Неверный код')
						.setColor(nek.config.errorcolor)
						.setDescription("Код не подошёл или вы его не указали. Напишите ваш 2FA код в конце сообщения через пробел. Например `" + nek.config.prefix + comm.name + " 013370`")
					await msg.reply({ embeds: [embed] });
					return;
				}
				if (Pass2FA === "no_secret") { // если нету секрета
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.errorcolor)
						.setDescription("Секрет не задан. Попробуйте создать его через `" + nek.config.prefix + "2fa create`")
					await msg.reply({ embeds: [embed] });
					return;
				}
				args.pop(); // удаляем код 2FA из аргументов после успешной проверки
			}
			
			timeouts.set(msg.author.id, {timestamp: startTime}); // добавляем пользователя в тайм-аут
			setTimeout(() => {
				timeouts.delete(msg.author.id); // удаляем из тайм-аута через 2 секунды
			}, 2000);
			
			works.set(msg.id, {name: comm.name, timestamp: startTime}); // запоминаем, что мы начали работу над этой командой
			nek.log('MESSAGE', 'Executed  "' + comm.name + '" (' + msg.id + ')', 'gray');
			try {
				await comm.run(nek, client, msg, args); // запускаем команду
			} catch(e) {
				console.error(e);
				let embed = new Discord.EmbedBuilder()
					.setTitle('Ошибка')
					.setColor(nek.config.errorcolor)
					.setDescription("Произошла неизвестная ошибка")
					.setFooter({text: e.name + ": " + e.message})
				msg.reply({ embeds: [embed] });
				return;
			}
			works.delete(msg.id); // удаляем, т.к. мы закончили работу
			nek.log('MESSAGE', 'Done with "' + comm.name + '" (' + msg.id + ') in ' + (Date.now() - startTime) + 'ms', 'gray');
			return;
		}
		client.on(Discord.Events.MessageCreate, async (msg) => { // если новое сообщение в чате
			messageHandler(msg); // обработать
		});
		client.on(Discord.Events.MessageUpdate, async (oldmsg, newmsg) => { // если сообщение обновлено (edit)
			if (oldmsg.content.trim() !== newmsg.content.trim()) { // если сообщение не совпадает по содержанию со старым, то
				messageHandler(newmsg); // обработать
			}
		});
		
		
		
		// КНОПКИ, СПИСКИ, СЛЭШ-КОМАНДЫ
		//
		// Пример значения msg.customId:
		//   <ID Пользователя, который в первый раз нажал на кнопку>_<можно ли другим людям нажимать на кнопку (0 или 1)>_<исполяемая команда>_<данные>
		// Пример:
		//   929443921069752331_0_help_Guide0
		client.on(Discord.Events.InteractionCreate, async (interaction) => {				
				if (!interaction.isButton() && !interaction.isStringSelectMenu()) { // если не кнопка и не список
					nek.log('INTERACTION', 'Got unknown interaction', 'gray');
					return;
				}
				if (!interaction.customId) {
					nek.log('INTERACTION', 'customId not found', 'gray');
					return;
				}
				
				const customId = interaction.customId.split("_"); // получаем customid как массив
				const msg = interaction.message;
				
				if (!customId[0].startsWith(interaction.user.id) && customId[1] == "0") { // если юзер с другим id и кнопку нельзя нажимать другим
					nek.log('INTERACTION', 'User is trying to press on someone else\'s interaction');
					interaction.reply({ content: 'Ты не можешь взаимодействовать с этим. Только изначальный автор сообщения может сделать это.', ephemeral: true});
					return;
				};
				const comm = nek.commands.get(customId[2]);
				if (!comm) {
					nek.log('INTERACTION', 'Unknown command!');
					return;
				}
				
				const startTime = Date.now(); // запоминаем когда начали работать над командой
				//const permsFunc = nek.functions.get("perms"); // получаем функцию проверки прав
				let sendMsgPerm = "SEND_MESSAGES"; // проверять право, которое даст нам печатать в КАНАЛАХ
				if (msg.channel.type === Discord.ChannelType.GuildForum || msg.channel.type === Discord.ChannelType.GuildPublicThread || msg.channel.type === Discord.ChannelType.GuildPrivateThread) {
					sendMsgPerm = "SEND_MESSAGES_IN_THREADS"; // если сообщение в ветке, то проверять право, которое даст нам печатать в ВЕТКАХ
				}
				const missingPerms = permsFunc.checkPerms(nek, msg, [sendMsgPerm, ...comm.perms]); // проверяем права и запоминаем, какие отсутствуют
				if (missingPerms[0]) { // если есть хоть одно отсутствующее право, то информируем пользователя
					nek.log('MESSAGE', 'Missing permission(s) [' + missingPerms.join(', ') + '] for "' + comm.name + '" (' + msg.id + ')', 'gray');
					if (!permsFunc.checkPerms(nek, msg, [sendMsgPerm, "EMBED_LINKS"])[0]) { // если можно печатать с эмбедами, то отправить ошибку эмбедом
						let embed = new Discord.EmbedBuilder()
							.setTitle('Нету нужных прав')
							.setColor(nek.config.errorcolor)
							.setDescription('Для работы команды `' + comm.name + '` нужны следующие права: `' + missingPerms.join(', ') + '`\n[Что значат эти буквы?](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)')
						await interaction.reply({ embeds: [embed] });
						return;
					} else if (!permsFunc.checkPerms(nek, msg, [sendMsgPerm])[0]) { // если вообще можно печатать, то отправить ошибку текстом
						await interaction.reply({content: '**ОШИБКА:**\nДля работы команды `' + comm.name + '` нужны следующие права: `' + missingPerms.join(', ') + '`\nЧто значат эти буквы?: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags'});
						return;
					} else { // если нельзя печатать, то отправить ошибку в лс
						let embed = new Discord.EmbedBuilder()
							.setTitle('Нету нужных прав')
							.setColor(nek.config.errorcolor)
							.setDescription('Для работы команды `' + comm.name + '` нужны следующие права: `' + missingPerms.join(', ') + '`\nСообщите об этом владельцу сервера!')
						await interaction.author.send({ embeds: [embed] });
						return;
					}
				}
				
				works.set(interaction.id, {name: comm.name, timestamp: startTime}); // запоминаем, что мы начали работу над этой командой
				nek.log('INTERACTION', 'Executed  "' + comm.name + '" (' + interaction.id + ')', 'gray');
				try {
					await comm.interaction(nek, client, interaction); // запускаем команду
				} catch(e) {
					console.error(e);
					let embed = new Discord.EmbedBuilder()
						.setTitle('Ошибка')
						.setColor(nek.config.errorcolor)
						.setDescription("Произошла неизвестная ошибка")
						.setFooter({text: e.name + ": " + e.message})
					interaction.message.reply({ embeds: [embed] });
					return;
				}
				works.delete(interaction.id); // удаляем, т.к. мы закончили работу
				nek.log('INTERACTION', 'Done with "' + comm.name + '" (' + interaction.id + ') in ' + (Date.now() - startTime) + 'ms', 'gray');
				return;
		});
    }
	
	
	async logErrors(nek, totalErrors){ // ВХОД И ЛОГ ОШИБОК РАЗРАБОТЧИКАМ
	
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
		client.once(Discord.Events.ClientReady, async () => {
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
		});
    }
}

module.exports = discord;

