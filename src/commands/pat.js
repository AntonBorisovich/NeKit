const Discord = require("discord.js");
const pet = require('pet-pet-gif');

class Pat {
    constructor(nek){
		this.version = "1.0";
		this.category = "fun";
		
		this.perms = ["EMBED_LINKS", "ATTACH_FILES"];
		this.args = "";
		this.advargs = "<юзер>";
		this.argsdesc = "<юзер> - упоминание человека, аватарка которого будет поглажена";
        this.desc = "погладить кого-то/пикчу";
		this.advdesc = "Делает гифку с рукой, которая гладит прикрепленное вами изображение или аватарку пользователя";
        this.name = "pat";
    }

    async run(nek, client, msg, args){
		let imgurl = false;
		if (args[1]) { // если указаны аргументы
			if (args[1].startsWith('<@') && !args[1].startsWith('<@&')) {
				await client.users.fetch(args[1].replace(/([\<\@\!\>])/g, "")).then(member => {
					imgurl = member.avatarURL();
					imgurl = imgurl.replace(/webp/g, "png");
				});
			}
		}
		if (!imgurl) { // если ссылки так и нету
			const getAttachFunc = nek.functions.get('getAttach');
			const attachment = await getAttachFunc.getAttach(nek, msg, 'any', 'image', 10, true); // любым методом / получить картинку / смотреть последние 10 сообщений / нужно первое найденное
			if (!attachment[0]) {
				let embed = new Discord.EmbedBuilder()
				.setTitle('Агде')
				.setColor(nek.config.errorcolor)
				.setDescription("Изображение не найдено. Попробуй прикрепить его или ответить на сообщение, где оно есть")
				msg.reply({ embeds: [embed] });
				return;
			}
			if (attachment[0]?.height > 5000 || attachment[0]?.width > 5000) {
				let embed = new Discord.EmbedBuilder()
				.setTitle('Братик, он слишком большой~')
				.setColor(nek.config.errorcolor)
				.setDescription("Изображение слишком большое")
				msg.reply({ embeds: [embed] });
				return;
			}
			imgurl = attachment[0].attachment;
		}
		
		msg.channel.sendTyping();
		const image = await pet(imgurl, {resolution: 160, delay: 24});
		await msg.reply({files: [{attachment: image, name: 'pat.gif'}]});
		return;
    }
}

module.exports = Pat;

