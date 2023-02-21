const Discord = require('discord.js'); //
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent], partials: [Discord.Partials.Channel]}); // создание пользователя с правами

	
class Main {
	constructor(nek, config){
		this.desc = "Основной модуль соцсети Discord для входа в Discord и обработки сообщений, кнопок, команд и иных событий.";
    };
	
    autorun(nek, config){ // исполняется единожды при запуске
		//nek.log('SOCIAL', 'There is no autorun needed!');
		return 'done';
	};
	
	work(nek, config){ // основная функция
		nek.log('DISCORD', 'Logging in...', 'blue');
		try {
			client.login(config.token_discord); // входим
		} catch(e) {
			nek.log('ERROR', 'An error has accoured during logging in Discord');
			console.error(e);
			process.exit(1);
		};
		
		client.on("messageCreate", async msg => { // обрабатываем сообщения
			let args = msg.content.split(" "); // форматируем аргументы
			if (args[0].toLowerCase().startsWith(nek.prefix)) { // если сообщение начинается с префикса то работать
				const cmd = args[0].substring(nek.prefix.length) // получаем имя вызываемой команды из сообщения
				args.shift() // обрезаем первый аргумент т.к. это имя команды
				console.log(nek)
				nek.commands.forEach(command => { // перебираем список команд в боте
					if (command.name == cmd.toLowerCase()) { // если команда в сообщении совпала с командой из списка бота то работать	
						if (msg.guild) { // если вызвано на сервере то проверить права
							let custom_perms = []
							if (command.discord_perms) { // если команда адаптирована для дискорда, то довериться ей и проверить её права
								custom_perms = command.perms
							} else if (command.perms) { // если команда унифицированная, то преобразовать права и проверить их
								command.perms.forEach(perm => {
									switch(perm) {
										case 'image':
											custom_perms.push('AttachFiles');
											break;
										case 'attachment':
											custom_perms.push('AttachFiles');
											break;
										case 'embed':
											custom_perms.push('EmbedLinks');
											break;
									}
								})
								console.log('done perms')
							} else { // если в команде нету никаких доп. прав, то считать, что команде нужен только текст
								custom_perms = []
							}
							let permissions = [];
							console.log('checking perms')
							if (msg.channel.type === Discord.ChannelType.GuildForum || msg.channel.type === Discord.ChannelType.GuildPublicThread || msg.channel.type === Discord.ChannelType.GuildPrivateThread) { // если форум или ветка то чекнуть можно ли в них печатать
								permissions = ['SendMessages', 'SendMessagesInThreads', ...custom_perms]; // задаём права, которые надо проверить
							} else {
								permissions = ['SendMessages', ...custom_perms]; // задаём права, которые надо проверить
							}
							
							let missing = [];
							permissions.forEach(perm => { // чекаем каждый пермишн
								if (perm) { // если строка случайно не пустая
									eval("if (!msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags." + perm + "])) { missing.push('" + perm + "') }") // дикий костыль но работает
								};
							});
							if (!missing[0] == "") { // если какое либо право не найдено то паника
								//funcs.error(kitsune, values, msg, args, command.name, "Required permissions not found: " + missing.join(', '));
								nek.log('DUMMY', "Required permissions not found: " + missing.join(', '), 'yellow')
								return;
							};
						};
						try {
							nek.log('DISCORD','Executed command ' + command.name, 'blue'); // логирование о проходе всех проверок и начале запуске команды
							command.run(nek, msg, args); // запуск команды
						} catch (error) { // если ошибка то логировать ошибку
							console.error(error)
						};
					}
				});
			};
			
		});
		
		client.once('ready', () => { // выполняется единожды при успешном входе в дискорд
			nek.log('DISCORD', 'Logged in', 'blue'); // уведомляем об успешном входе
			client.user.setStatus('online'); // статус в сети
			client.user.setActivity(nek.prefix + 'help'); // играет в <prefix>help
			nek.log('INFO', 'Total launch time: ' + ((Date.now() - nek.launch_time) / 1000 ) + 's');
			nek.log('DISCORD', client.user.username + ' (ver: ' + nek.version + ') is ready to work!', 'blue');
		});
	};
	
	
};

module.exports = Main