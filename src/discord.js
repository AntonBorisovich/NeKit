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

let works = new Discord.Collection(); // коллекция, где хрянятся все команды, которые обрабатываются (а надо ли это вообще? TODO)
let msgTimeouts = []; // массив, где хрянятся пользователи с кулдауном по сообщениям
let interactionTimeouts = []; // массив, где хрянятся пользователи с кулдауном по интеракциям
let ignoreNewMsg = false; // если true, то команды не будут исполнятся

class discord {
    constructor(nek){
		this.name = "discord";
		this.version = "1.1.0";
    }
	
    async start(nek){ // ОБЫЧНОЕ НАЧАЛО РАБОТЫ
		client.version = this.version; // задаём версию socfile-а
		const permsFunc = nek.functions.get("perms"); // получаем функцию проверки прав, она будет использоватся далее
		const logger = nek.functions.get("logger"); // получаем функцию логирования
		
		process.on("uncaughtException", function (err) {
			nek.errorsCount = nek.errorsCount + 1;
			logger.uncaughtError(nek, client, err);
		});
		
		if (nek.config.debug) {
			client.on("debug", async (info) => {nek.log("DEBUG", info, "yellow")});
			client.on("warn", async (info) => {nek.log("WARN", info, "yellow")});
		}
		
		// ФУНКЦИЯ ПЕРЕПОДКЛЮЧЕНИЯ
		nek.reconnect = () => { // функция переподключения
			nek.log("DISCORD", "Reconnecting...", "cyan")
			if (works.size !== 0) { // если никто не юзает бота сейчас
				ignoreNewMsg = true; // запрещаем выполнять команды пользователям
				client.user.setStatus("idle"); // статус не на месте
				client.user.setActivity("Переподключаюсь..."); // играет в Переподключаюсь...
				nek.log("DISCORD", "Someone is using bot right now. Trying again in 5 seconds...", "cyan")
				setTimeout(() => { // пробуем ещё раз через 5 секунд.
					nek.reconnect();
				}, 5000);
				return;
			}
			nek.log("DISCORD", "Logging out...", "cyan", true)
			client.destroy(); // выходим
			nek.simplelog("OK!", "green")
			nek.log("DISCORD", "Logging in...", "cyan", true)
			client.login(nek.config["token_" + this.name]); // входим
			nek.simplelog("OK!", "green")
			setTimeout(() => { // задаем статусы через 5 секунд
				ignoreNewMsg = false; // разрешаем выполнять команды пользователям
				if (!nek.config.noActivity) {
					client.user.setStatus("online"); // статус
					client.user.setActivity(nek.config.prefix + "help"); // играет в <prefix>help
				}
			}, 5000);
			return;
		}
		
		// ПОСЛЕ ВХОДА
		client.once(Discord.Events.ClientReady, async () => { // когда залогинились
			nek.loginTime = Date.now(); // запоминаем дату логина
			nek.log("DISCORD", "Logged in as " + client.user.tag, "cyan"); // залогинились как *имя бота*
			nek.log(" READY ", `Total launch time: ${((Date.now() - nek.launchTime) / 1000 )}s`, "green"); // логируем что залогинились за n секунд с запуска бота
			if (!nek.config.noActivity) {
				client.user.setStatus("online"); // статус
				client.user.setActivity(nek.config.prefix + "help"); // играет в <prefix>help
			}
			
			// Делаем сообщение разрабам
			let embed = new Discord.EmbedBuilder()
				.setTitle("Logged in")
				.setColor(nek.config.basecolor)
				.setDescription(nek.config.fullname + " is ready to work!\n\nBootloader ver: `" + nek.config.version + "`\n" + this.name + " ver: `" + this.version + "`")
				.setTimestamp();
			const botowner = await client.users.fetch(nek.config.developers[0]); // ищем разработчика по id
			await botowner.send({ embeds: [embed] }); // отправляем разрабу
		});
		
		// СООБЩЕНИЯ
		async function messageHandler(msg){
			if (ignoreNewMsg || msg.author.bot) return; // если запрещено исполнять новую команду или пользователь - бот, то игнорим
			
			msg.content = msg.content.trim(); // убираем лишние пробелы с начала и конца, что бы корректно найти префикс
			if (msg.content.substring(0, nek.config.prefix.length).toLowerCase() !== nek.config.prefix) return; // если не найден префикс - игнор

			let args = msg.content.split(" "); // разделяем всё сообщение на слова (через пробел)
			
			const commName = args[0].slice(nek.config.prefix.length); // выделяем название команды
			let comm = nek.commands.get(commName); // получаем команду из мапы
			if (!comm) return; // если такая команда не найдена - игнор
			
			// КОМАНДА НАЙДЕНА
			if (msgTimeouts.includes(msg.author.id)) { // если пользователь в списке тайм-аута, то игнор
				nek.log("MESSAGE", msg.author.id + " is on cooldown", "gray");
				return;
			}

			const startTime = Date.now(); // запоминаем когда начали работать над командой
			
			if (args[args.length-1].toLowerCase() === "--help") { // если последний аргумент - "--help" (а надо ли это? TODO)
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
				nek.log("MESSAGE", "Missing permission(s) [" + missingPerms.join(", ") + "] for \"" + comm.name + "\" (" + msg.id + ")", "gray");
				if (!permsFunc.checkPerms(nek, msg, [sendMsgPerm, "EMBED_LINKS"])[0]) { // если можно печатать с эмбедами, то отправить ошибку эмбедом
					let embed = new Discord.EmbedBuilder()
						.setTitle("Отсутствуют права")
						.setColor(nek.config.errorcolor)
						.setDescription("Для работы команды `" + comm.name + "` нужны следующие права: `" + missingPerms.join(", "));
					await msg.reply({ embeds: [embed] });
					return;
				} else if (!permsFunc.checkPerms(nek, msg, [sendMsgPerm])[0]) { // если вообще можно печатать, то отправить ошибку текстом
					await msg.reply({content: "**ОШИБКА:**\nДля работы команды `" + comm.name + "` нужны следующие права: `" + missingPerms.join(", ")});
					return;
				} else { // если нельзя печатать, то отправить ошибку в лс
					let embed = new Discord.EmbedBuilder()
						.setTitle("Отсутствие прав")
						.setColor(nek.config.errorcolor)
						.setDescription("Для работы команды `" + comm.name + "` нужны следующие права: `" + missingPerms.join(", ") + "`\nСообщите об этом владельцу сервера!");
					await msg.author.send({ embeds: [embed] });
					return;
				}
			}
			
			if (comm.TWOFA) { // если для запуска нужна двухфакторка, то проверить код
				nek.log("MESSAGE", "Got 2FA command", "gray");
				const twofaComm = nek.commands.get("2fa");
				if (!twofaComm) { // проверяем есть ли вообще команда 2FA
					let embed = new Discord.EmbedBuilder()
						.setTitle("Команда 2FA не найдена!")
						.setColor(nek.config.errorcolor)
						.setDescription("Это невозможно, но команда 2FA не найдена. Вы не можете использовать 2FA команды");
					await msg.reply({ embeds: [embed] });
					return;
				}

				const Pass2FA = await twofaComm.Check2FA(nek, args[args.length-1]);
				if (!Pass2FA) { // если получили отрицательный ответ
					nek.log("MESSAGE", "Wrong 2FA code", "gray");
					let embed = new Discord.EmbedBuilder()
						.setTitle("Неверный код")
						.setColor(nek.config.errorcolor)
						.setDescription("Код не подошёл или вы его не указали. Напишите ваш 2FA код в конце сообщения через пробел. Например `" + nek.config.prefix + comm.name + " 013370`");
					await msg.reply({ embeds: [embed] });
					return;
				}
				if (Pass2FA === "no_secret") { // если нету секрета
					let embed = new Discord.EmbedBuilder()
						.setTitle("2FA")
						.setColor(nek.config.errorcolor)
						.setDescription("Секрет не задан. Попробуйте создать его через `" + nek.config.prefix + "2fa create`");
					await msg.reply({ embeds: [embed] });
					return;
				}
				if (Pass2FA !== "bypassed") args.pop(); // удаляем код 2FA из аргументов после успешной проверки
			}
			
			if (nek.config.msgCooldown) { // если включен кулдаун
				msgTimeouts.push(msg.author.id); // добавляем пользователя в кулдаун
				setTimeout(() => {
					msgTimeouts.splice(msgTimeouts.indexOf(msg.author.id), 1); // удаляем пользователя из кулдауна
				}, nek.config.msgCooldown);
			}
			
			works.set(msg.id, {name: comm.name, timestamp: startTime}); // запоминаем, что мы начали работу над этой командой
			nek.log("MESSAGE", "Executing \"" + comm.name + "\" (" + msg.id + ")", "gray");
			try {
				await comm.run(nek, client, msg, args); // запускаем команду
			} catch(e) {
				nek.errorsCount += 1;
				works.delete(msg.id); // удаляем, т.к. мы закончили работу
				console.error(e);
				let embed = new Discord.EmbedBuilder()
					.setTitle("Ошибка")
					.setColor(nek.config.errorcolor)
					.setDescription("Произошла неизвестная ошибка")
					.setFooter({text: e.name + ": " + e.message});
				msg.reply({ embeds: [embed] });
				return;
			}
			works.delete(msg.id); // удаляем, т.к. мы закончили работу
			nek.log("MESSAGE", "Executed  \"" + comm.name + "\" (" + msg.id + ") in " + (Date.now() - startTime) + "ms", "gray");
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
			//if (interaction.isModalSubmit()) return; // тихо игнорим modal (они должны обрабатываться в коде команды)

			if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) { // если и не кнопка, и не список, и не modal
				nek.log("INTERACTION", "Unknown interaction (" + interaction.id + ")", "gray");
				return;
			}
			if (!interaction.customId) {
				nek.log("INTERACTION", "Incorrect interaction (" + interaction.id + ")", "gray");
				return;
			}
			
			if (interactionTimeouts.includes(interaction.user.id)) { // если пользователь в списке кулдауна, то игнор
				nek.log("INTERACTION", interaction.user.id + " is on cooldown. Ingoring (" + interaction.id + ")", "gray");
				interaction.reply({ content: "Попробуйте позже", ephemeral: true});
				return;
			}
			
			const customId = interaction.customId.split("_"); // получаем customid как массив
			const msg = interaction.message;
			
			if (!customId[0].startsWith(interaction.user.id) && customId[1] == "0") { // если юзер с другим id и кнопку нельзя нажимать другим
				nek.log("INTERACTION", interaction.user.id + " tried to use someone else \'s interaction (" + interaction.id + ")");
				await interaction.reply({ content: "Ты не можешь взаимодействовать с этим. Только изначальный автор сообщения может сделать это.", ephemeral: true});
				return;
			};
			const comm = nek.commands.get(customId[2]);
			if (!comm) {
				nek.log("INTERACTION", "Command " + customId[2] + " not found (" + interaction.id + ")");
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
				nek.log("INTERACTION", "Missing permission(s) [" + missingPerms.join(", ") + "] for \"" + comm.name + "\" (" + interaction.id + ")", "gray");
				if (!permsFunc.checkPerms(nek, msg, [sendMsgPerm, "EMBED_LINKS"])[0]) { // если можно печатать с эмбедами, то отправить ошибку эмбедом
					let embed = new Discord.EmbedBuilder()
						.setTitle("Нету нужных прав")
						.setColor(nek.config.errorcolor)
						.setDescription("Для работы команды `" + comm.name + "` нужны следующие права: `" + missingPerms.join(", ") + "`\n[Что значат эти буквы?](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)");
					await interaction.reply({ embeds: [embed] });
					return;
				} else if (!permsFunc.checkPerms(nek, msg, [sendMsgPerm])[0]) { // если вообще можно печатать, то отправить ошибку текстом
					await interaction.reply({content: "**ОШИБКА:**\nДля работы команды `" + comm.name + "` нужны следующие права: `" + missingPerms.join(", ") + "`\nЧто значат эти буквы?: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags"});
					return;
				} else { // если нельзя печатать, то отправить ошибку в лс
					let embed = new Discord.EmbedBuilder()
						.setTitle("Нету нужных прав")
						.setColor(nek.config.errorcolor)
						.setDescription("Для работы команды `" + comm.name + "` нужны следующие права: `" + missingPerms.join(", ") + "`\nСообщите об этом владельцу сервера!");
					await interaction.author.send({ embeds: [embed] });
					return;
				}
			}
			
			if (nek.config.interactionCooldown) { // если включен кулдаун
				interactionTimeouts.push(interaction.user.id); // добавляем пользователя в кулдаун
				setTimeout(() => {
					interactionTimeouts.splice(interactionTimeouts.indexOf(interaction.user.id), 1); // удаляем пользователя из кулдауна
				}, nek.config.interactionCooldown);
			}
			
			works.set(interaction.id, {name: comm.name, timestamp: startTime}); // запоминаем, что мы начали работу над этой командой
			nek.log("INTERACTION", "Executing \"" + comm.name + "\" (" + interaction.id + ")", "gray");
			try {
				await comm.interaction(nek, client, interaction); // запускаем команду
			} catch(e) {
				nek.errorsCount = nek.errorsCount + 1;
				console.error(e);
				let embed = new Discord.EmbedBuilder()
					.setTitle("Ошибка")
					.setColor(nek.config.errorcolor)
					.setDescription("Произошла неизвестная ошибка")
					.setFooter({text: e.name + ": " + e.message});
				interaction.message.reply({ embeds: [embed] });
				return;
			}
			works.delete(interaction.id); // удаляем, т.к. мы закончили работу
			nek.log("INTERACTION", "Executed  \"" + comm.name + "\" (" + interaction.id + ") in " + (Date.now() - startTime) + "ms", "gray");
			return;
		});
		
		// ВХОД
		try {
			nek.log("DISCORD", "Logging in...", "cyan");
			client.login(nek.config["token_" + this.name]); // логинимся в дискорд
			//nek.config["token_" + this.name] = null;
		} catch(e) {
			nek.log("ERROR", "Failed to login!", "red"); // сообщаем, что всё всё пошло по жопе
			console.error(e); // вывод полной ошибки
			process.exit(1); // закрываем бота
		}
    }
	
	
	async logErrors(nek, totalErrors){ // ВХОД И ЛОГ ОШИБОК РАЗРАБОТЧИКАМ
		// КОГДА ВОШЛИ
		client.once(Discord.Events.ClientReady, async () => {
			try {
				client.user.setStatus("invisible"); // статус невидимки
				nek.log("DISCORD", "Logged in as " + client.user.tag, "cyan"); // логируем что залогинились

				let embed = new Discord.EmbedBuilder() // составляем embed
					.setTitle("Bootloader Error")
					.setColor(nek.config.errorcolor)
					.setDescription("Got errors while loading:\n```" + totalErrors.join("\n\n") + "```")
					.setTimestamp();
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
		
		// ВХОД
		try {
			nek.log("DISCORD", "Logging in...", "cyan");
			client.login(nek.config["token_" + this.name]); // логинимся в дискорд
		} catch(e) {
			nek.log("ERROR", "Failed to login!", "red"); // сообщаем, что всё всё пошло по жопе
			console.error(e); // вывод полной ошибки
			process.exit(1); // закрываем бота
		}
    }
}

module.exports = discord;

