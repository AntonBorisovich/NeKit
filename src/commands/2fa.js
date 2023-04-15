const twofactor = require("node-2fa");
const Discord = require("discord.js");
let tempSecret2FA = false;

class TwoFA {
    constructor(nek){
		this.version = '1.0'
		//задать полученые значения для дальнейшего использования в коде команды
		//this.nek = nek;
        //this.config = config;
		
		this.category = "utility"; // категория команд
		this.hidden = true; // можно ли отображать команду в общем списке
		this.perms = ["EMBED_LINKS"];
		
        this.name = "2fa"; // имя команды
		this.desc = "настройка 2FA"; // описание команды в общем списке команд
		this.advdesc = "Настройка, обновление, проверка 2FA кода"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = ""; // описание аргументов в помоще по конкретной команде
		this.advargs = ""; // аргументы в помоще по конкретной команде
    }

    run(nek, client, msg, args){
		if (!args[1]) {
			let embed = new Discord.EmbedBuilder()
				.setTitle('2FA')
				.setColor(nek.config.basecolor)
				.setDescription("Без аргументов я ниче тебе сделать не могу. Можешь ввести " + nek.config.prefix + "help " + this.name + " для просмотра аргументов")
			msg.reply({ embeds: [embed] });
			return;
		}
		switch(args[1].toLowerCase()) { // проверяем аргумент
			case 'create': // создать новый секрет
				if (!nek.config.Secret2FA) { // если не задан секрет
					if (msg.author.id !== nek.config.developers[0]) { // если автор сообщения не разработчик, то забить
						let embed = new Discord.EmbedBuilder()
							.setTitle('Новый 2FA')
							.setColor(nek.config.basecolor)
							.setDescription("Ключ (секрет) не задан. И вы не разработчик, так что повлиять на это не можете.")
						msg.reply({ embeds: [embed] });
						break;
					}
					
					// если автор сообщения - разраб, то начинаем начинать
					
					tempSecret2FA = twofactor.generateSecret({ name: nek.fullname, account: nek.name }); // создаём временный секрет
					
					// публичное сообщение
					let embed = new Discord.EmbedBuilder() 
						.setTitle('Новый 2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Вам был отправлен ключ (секрет), так как он не был задан ранее. Для его закрепления вам нужно ввести `" + nek.config.prefix + this.name + " verify <код>`")
					msg.reply({ embeds: [embed] });
					// сообщение в лс
					embed = new Discord.EmbedBuilder() 
						.setTitle('Новый 2FA')
						.setColor(nek.config.basecolor)
						.setDescription(
							"Прикинь, этот текст здесь потому, что первую строку мессенджеры не хотят прятать в спойлер и спокойно показывают секретный код всем желающим.\n" +
							"И всё таки вот твой код:\n\n" +
							"Ключ - ||" + tempSecret2FA.secret + "||\n\n" +
							"Можно и нажать - [Открыть 2FA приложение](" + tempSecret2FA.uri + ")"
						)
					msg.author.send({ embeds: [embed], files:[{attachment: tempSecret2FA.qr, name: "SPOILER_chart.png"}] });
					break;
				}
				if (!args[2]) {
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Введите `" + nek.config.prefix + this.name + " create <код>` что бы заново сгенерировать ключ (секрет)")
					msg.reply({ embeds: [embed] });
					break;
				}
				
				// обновление секрета
				if (msg.author.id !== nek.config.developers[0]) { // если автор сообщения не разработчик, то забить
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Секрет может обновить только разработчик")
					msg.reply({ embeds: [embed] });
					break;
				}
				if (this.Check2FA(nek, args[2])) { // если код подошёл
					tempSecret2FA = twofactor.generateSecret({ name: nek.fullname, account: nek.name }); // создаём временный секрет
					
					// публичное сообщение
					let embed = new Discord.EmbedBuilder() 
						.setTitle('Новый 2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Вам был отправлен новый ключ (секрет). Для его закрепления вам нужно ввести `" + nek.config.prefix + this.name + " verify <код>`")
					msg.reply({ embeds: [embed] });

					// сообщение в лс
					embed = new Discord.EmbedBuilder() 
						.setTitle('Новый 2FA')
						.setColor(nek.config.basecolor)
						.setDescription(
							"Прикинь, этот текст здесь потому, что первую строку мессенджеры не хотят прятать в спойлер и спокойно показывают секретный код всем желающим.\n" +
							"И всё таки вот твой код:\n\n" +
							"Ключ - ||" + tempSecret2FA.secret + "||\n\n" +
							"Можно и нажать - [Открыть 2FA приложение](" + tempSecret2FA.uri + ")"
						)
					msg.author.send({ embeds: [embed], files:[{attachment: tempSecret2FA.qr, name: "SPOILER_chart.png"}] });
					break;
				}
				break;
			case 'verify': // проверка чего либо. Можно как проверить актуальность секрета у пользователя, так и закрепить новый секрет, если он был ранее создан в 2fa create и требует подтверждения
				if (!args[2]) { // если нету никакого кода, то забить
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("А чё проверять то?")
					msg.reply({ embeds: [embed] });
					break;
				}
				if (tempSecret2FA?.secret) { // если есть временный секрет (т.е. надо его подтвердить)
					const Pass2FA = twofactor.verifyToken(tempSecret2FA.secret, args[2]); // проверяем подходит ли код к временному секрету
					if (Pass2FA?.delta === 0) { // если всё сошлось
						let embed = new Discord.EmbedBuilder()
							.setTitle('2FA')
							.setColor(nek.config.basecolor)
							.setDescription("Проверка пройдена. Новый ключ (секрет) записан")
						msg.reply({ embeds: [embed] });
						const updsecret = nek.Update2FASecret(tempSecret2FA.secret); // пытаемся записать новый секрет в файл
						tempSecret2FA = false; // убираем временный токен
						if (updsecret !== 'done') { // если чето пошло не так, то сообщить об этом
							let embed = new Discord.EmbedBuilder()
								.setTitle('2FA')
								.setColor(nek.config.basecolor)
								.setDescription("Произошла ошибка записи нового секрета. Попробуйте ещё раз")
							msg.reply({ embeds: [embed] });
							break;
						}
						
						// TODO: Удаление сообщения после записи нового секрета
						
						//tempMsg.delete();
						//tempMsg.channel.send({content: '*Сообщение удалено. Ключей не будет*'});
						//tempMsg = false;
						break;
					}
					
					// другие сообщения на случай, если код не подходит или просрочен.
					if (Pass2FA?.delta === -1) {
						let embed = new Discord.EmbedBuilder()
							.setTitle('2FA')
							.setColor(nek.config.basecolor)
							.setDescription("Неа. Опоздал. Код больше не подходит. Попробуй ещё раз.")
						msg.reply({ embeds: [embed] });
						break;
					} else if (Pass2FA?.delta === 1) {
						let embed = new Discord.EmbedBuilder()
							.setTitle('2FA')
							.setColor(nek.config.basecolor)
							.setDescription("Ты из будущего что ли? Этот код пока не подходит. Подожди и попробуй ещё раз.")
						msg.reply({ embeds: [embed] });
						break;
					} else {
						let embed = new Discord.EmbedBuilder()
							.setTitle('2FA')
							.setColor(nek.config.basecolor)
							.setDescription("Код не подошёл. Попробуй ещё раз.")
						msg.reply({ embeds: [embed] });
						break;
					}
				}
				if (!nek.config.Secret2FA) {
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("ам. пук среньк. где секрет то?")
					msg.reply({ embeds: [embed] });
					break;
				}
				if (this.Check2FA(nek, args[2])) {
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Верный код")
					msg.reply({ embeds: [embed] });
					break;
				} else {
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.errorcolor)
						.setDescription("Неа. Код не подошёл")
					msg.reply({ embeds: [embed] });
					break;
				}
				break;
			return;
		}
	}
	
	Check2FA(nek, code){
		if (!nek?.config.Secret2FA) {
			return 'no_secret';
		}
		if (twofactor.verifyToken(nek.config.Secret2FA, code)?.delta === 0) {
			return true;
		}
		return false;
	}
	
}

module.exports = TwoFA

