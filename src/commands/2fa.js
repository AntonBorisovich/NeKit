const twofactor = require("node-2fa");
const Discord = require("discord.js");
const fs = require("fs");
let tempSecret2FA = false;
let tempMessage2FA = false;
let Bypass2FA = false;

class TwoFA {
    constructor(nek){
		this.version = '1.1';
		//задать полученые значения для дальнейшего использования в коде команды
		//this.nek = nek;
        //this.config = config;
		
		this.category = "utility"; // категория команд
		this.hidden = true; // можно ли отображать команду в общем списке
		this.perms = ["EMBED_LINKS"];
		
        this.name = "2fa"; // имя команды
		this.desc = "настройка 2FA"; // описание команды в общем списке команд
		this.advdesc = "Настройка, обновление, проверка 2FA кода"; // описание команды в помоще по конкретной команде
		this.args = "<операция>"; // аргументы в общем списке команд
		this.argsdesc = // описание аргументов в помоще по конкретной команде
		"`create` - создать новый ключ (секрет)\n" +
		"`verify <код>` - проверить код\n" +
		"`bypass <код>` - исполнять 2fa команды без кода (только в режиме debug)";
		this.advargs = "<операция>"; // аргументы в помоще по конкретной команде
    }

    async run(nek, client, msg, args){
		if (!args[1]) {
			let embed = new Discord.EmbedBuilder()
				.setTitle('2FA')
				.setColor(nek.config.basecolor)
				.setDescription("Без аргументов я ниче тебе сделать не могу. Можешь ввести " + nek.config.prefix + "help " + this.name + " для просмотра аргументов")
			await msg.reply({ embeds: [embed] });
			return;
		}
		switch(args[1].toLowerCase()) { // проверяем аргумент
			case 'create': // создать новый секрет
				if (!nek.config.Secret2FA) { // если не задан секрет
					if (!nek.config.developers.includes(msg.author.id)) { // если автор сообщения не разработчик, то забить
						let embed = new Discord.EmbedBuilder()
							.setTitle('Новый 2FA')
							.setColor(nek.config.basecolor)
							.setDescription("Ключ (секрет) не задан. И вы не разработчик, так что повлиять на это не можете.")
						await msg.reply({ embeds: [embed] });
						break;
					}
					
					// если автор сообщения - разраб, то начинаем начинать
					
					tempSecret2FA = twofactor.generateSecret({ name: nek.fullname, account: nek.name }); // создаём временный секрет
					
					// публичное сообщение
					let embed = new Discord.EmbedBuilder() 
						.setTitle('Новый 2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Вам был отправлен ключ (секрет), так как он не был задан ранее. Для его закрепления вам нужно ввести `" + nek.config.prefix + this.name + " verify <код>`")
					await msg.reply({ embeds: [embed] });
					// сообщение в лс
					embed = new Discord.EmbedBuilder() 
						.setTitle('Новый 2FA')
						.setColor(nek.config.basecolor)
						.setDescription(
							"Прикинь, этот текст здесь потому, что первую строку мессенджеры не хотят прятать в спойлер и спокойно показывают секретный код всем желающим.\n" +
							"И всё таки вот твой код:\n\n" +
							"Ключ - ||" + tempSecret2FA.secret + "||"
						);
					tempMessage2FA = await msg.author.send({ embeds: [embed], files:[{attachment: tempSecret2FA.qr, name: "SPOILER_chart.png"}] });
					break;
				}
				if (!args[2]) {
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Введите `" + nek.config.prefix + this.name + " create <код>` что бы заново сгенерировать ключ (секрет)")
					await msg.reply({ embeds: [embed] });
					break;
				}
				
				// обновление секрета
				if (!nek.config.developers.includes(msg.author.id)) { // если автор сообщения не разработчик, то забить
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Секрет может обновить только разработчик");
					await msg.reply({ embeds: [embed] });
					break;
				}
				if (this.Check2FA(nek, args[2])) { // если код подошёл
					tempSecret2FA = twofactor.generateSecret({ name: nek.fullname, account: nek.name }); // создаём временный секрет
					
					// публичное сообщение
					let embed = new Discord.EmbedBuilder() 
						.setTitle('Новый 2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Вам был отправлен новый ключ (секрет). Для его закрепления вам нужно ввести `" + nek.config.prefix + this.name + " verify <код>`");
					await msg.reply({ embeds: [embed] });

					// сообщение в лс
					embed = new Discord.EmbedBuilder() 
						.setTitle('Новый 2FA')
						.setColor(nek.config.basecolor)
						.setDescription(
							"Прикинь, этот текст здесь потому, что первую строку мессенджеры не хотят прятать в спойлер и спокойно показывают секретный код всем желающим.\n" +
							"И всё таки вот твой код:\n\n" +
							"Ключ - ||" + tempSecret2FA.secret + "||"
						);
					tempMessage2FA = await msg.author.send({ embeds: [embed], files:[{attachment: tempSecret2FA.qr, name: "SPOILER_chart.png"}] });
					break;
				}
				break;
			case 'verify': // проверка чего либо. Можно как проверить актуальность секрета у пользователя, так и закрепить новый секрет, если он был ранее создан в 2fa create и требует подтверждения
				if (!args[2]) { // если нету никакого кода, то забить
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Укажите код");
					await msg.reply({ embeds: [embed] });
					break;
				}
				if (tempSecret2FA?.secret) { // если есть временный секрет (т.е. надо его подтвердить)
					const Pass2FA = twofactor.verifyToken(tempSecret2FA.secret, args[2]); // проверяем подходит ли код к временному секрету
					if (Pass2FA?.delta === 0) { // если всё сошлось
						const file = require('../config/secrets.json'); // читаем json
						file.Secret2FA = tempSecret2FA.secret; // добавляем/изменяем секрет
						fs.writeFile('./src/config/secrets.json', JSON.stringify(file, null, '\t'), (err) => { // пишем новый файл
							if (err) throw(err);
						});
						nek.config.Secret2FA = tempSecret2FA.secret;
						
						tempSecret2FA = false; // убираем временный токен
						
						// TODO: Удаление сообщения после записи нового секрета
						
						tempMessage2FA.channel.send({content: '*Тут было сообщение с ключом (секретом) 2FA, но мы его удалили, так как ключ (секрет) был применён*'});
						tempMessage2FA.delete();
						tempMessage2FA = false;
						
						let embed = new Discord.EmbedBuilder()
							.setTitle('2FA')
							.setColor(nek.config.basecolor)
							.setDescription("Новый ключ (секрет) записан");
						await msg.reply({ embeds: [embed] });
						break;
					}
					
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Код не подошёл. Попробуй ещё раз")
					await msg.reply({ embeds: [embed] });
					break;
				}
				if (!nek.config.Secret2FA) {
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Ключ (секрет) не указан. Попробуйте создать его через `" + nek.config.prefix + this.name + " create`")
					await msg.reply({ embeds: [embed] });
					break;
				}
				if (this.Check2FA(nek, args[2])) {
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Верный код")
					await msg.reply({ embeds: [embed] });
					break;
				} else {
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.errorcolor)
						.setDescription("Код не подошёл")
					await msg.reply({ embeds: [embed] });
					break;
				}
				break;
			case 'bypass':
				if (!nek.config.developers.includes(msg.author.id)) { // если автор сообщения не разработчик, то забить
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Только разработчик может включить обход 2FA кода")
					await msg.reply({ embeds: [embed] });
					break;
				}
				if (!nek.config.debug) { // если автор сообщения не разработчик, то забить
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Только в debug режиме можно включить обход 2FA кода")
					await msg.reply({ embeds: [embed] });
					break;
				}
				if (!args[2]) { // если нету никакого кода, то забить
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Укажите код")
					await msg.reply({ embeds: [embed] });
					break;
				}
				if (args[2].toLowerCase() === "disable") {
					if (Bypass2FA === false) {
						let embed = new Discord.EmbedBuilder()
							.setTitle('2FA')
							.setColor(nek.config.basecolor)
							.setDescription("Обход 2FA кода уже выключен")
						await msg.reply({ embeds: [embed] });
						break;
					}
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Обход 2FA кода теперь выключен")
					await msg.reply({ embeds: [embed] });
					Bypass2FA = false;
					break;
				}
				if (Bypass2FA === true) {
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.basecolor)
						.setDescription("Обход 2FA кода уже включен. Введите `" + nek.config.prefix + this.name + " bypass disable` для его отключеня")
					await msg.reply({ embeds: [embed] });
					break;
				}
				if (this.Check2FA(nek, args[2])) {
					if (Bypass2FA === false) {
						Bypass2FA = args[2];
						let embed = new Discord.EmbedBuilder()
							.setTitle('2FA')
							.setColor(nek.config.basecolor)
							.setDescription("Для подтверждения включения обхода 2FA кода введите другой валидный код. То есть просто подождите секунд 30 и введите новый код снова")
						await msg.reply({ embeds: [embed] });
						break;
					} else if (Bypass2FA !== true && Bypass2FA !== false) { // если значение отличное от true или false, т.е. предположительно там первый код
						if (args[2] === Bypass2FA) {
							let embed = new Discord.EmbedBuilder()
								.setTitle('2FA')
								.setColor(nek.config.errorcolor)
								.setDescription("Подождите немного и введите отличный от первого код")
							await msg.reply({ embeds: [embed] });
							break;
						}
						let embed = new Discord.EmbedBuilder()
							.setTitle('2FA')
							.setColor(nek.config.basecolor)
							.setDescription("Обход 2FA включен. Теперь любой код будет считаться валидным. Не забудьте его выключить через `" + nek.config.prefix + this.name + " bypass disable` или перезагрузку бота")
						await msg.reply({ embeds: [embed] });
						Bypass2FA = true;
					} else {
						let embed = new Discord.EmbedBuilder()
							.setTitle('2FA')
							.setColor(nek.config.errorcolor)
							.setDescription("Что-то пошло не так")
						await msg.reply({ embeds: [embed] });
						break;
					}
				} else {
					let embed = new Discord.EmbedBuilder()
						.setTitle('2FA')
						.setColor(nek.config.errorcolor)
						.setDescription("Код не подошёл. Попробуйте заново")
					await msg.reply({ embeds: [embed] });
					if (Bypass2FA !== true) Bypass2FA = false;
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
		if (Bypass2FA === true && nek.config.debug === true) {
			return 'bypassed';
		}
		return false;
	}
	
}

module.exports = TwoFA

