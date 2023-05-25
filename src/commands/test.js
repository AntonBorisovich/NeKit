const Discord = require("discord.js");

class Test {
    constructor(nek){
		this.version = "version";
		this.category = "test"; // категория команд
		this.hidden = true; // можно ли отображать команду в общем списке
		
		this.perms = ["EMBED_LINKS"];
        this.name = "test"; // имя команды
		this.desc = "desc"; // описание команды в общем списке команд
		this.advdesc = "advdesc"; // описание команды в помоще по конкретной команде
		this.args = "args"; // аргументы в общем списке команд
		this.argsdesc = "argsdesc"; // описание аргументов в помоще по конкретной команде
		this.advargs = "advargs"; // аргументы в помоще по конкретной команде
    }

    run(nek, client, msg, args){
		args.shift();
		msg.channel.send(false);
		const stts = nek.commands.get('stts');
		const trans = stts.searchOneTransportFull();
		let embed = new Discord.EmbedBuilder() // составляем embed
			.setTitle("№" + trans.label) // заголовок
			.setDescription(
				"**[" + trans.model + "](" + trans.links.vehicle + ")**\n" +
				"[" + trans.park + "](" + trans.links.park + ")\n\n" +
				"**[Последнее фото №" + trans.label + " на transphotos.org](" + trans.links.photo + ")**\n" +
				"Улица: " + trans.street + "\n" +
				"Дата: " + trans.date + "\n" +
				"Автор: " + trans.author
			)
			.setColor(nek.config.basecolor) // цвет
			.setImage(trans.fullPic)
			
		const select = new Discord.StringSelectMenuBuilder()
			.setCustomId('zaebal')
			.setPlaceholder('Давай выбирай...')
			.addOptions(
				new Discord.StringSelectMenuOptionBuilder()
					.setLabel('1337')
					.setValue('1337'),
				new Discord.StringSelectMenuOptionBuilder()
					.setLabel('0228')
					.setValue('0228'),
				new Discord.StringSelectMenuOptionBuilder()
					.setLabel('5051')
					.setValue('5051'),
			);
		const geo = new Discord.ButtonBuilder()
			.setCustomId('geo')
			.setLabel('Местоположение')
			.setStyle(Discord.ButtonStyle.Primary);
		const photo = new Discord.ButtonBuilder()
			.setCustomId('photo')
			.setLabel('Фото')
			.setStyle(Discord.ButtonStyle.Primary);
		const update = new Discord.ButtonBuilder()
			.setCustomId('update')
			.setLabel('Обновить')
			.setStyle(Discord.ButtonStyle.Secondary);

		const row1 = new Discord.ActionRowBuilder().addComponents(select);
		const row2 = new Discord.ActionRowBuilder().addComponents(geo, photo, update);
		
		msg.reply({content: "||trolley-1337-0228-5051||", embeds: [embed], components: [row1, row2]});
		return;
	}
}

module.exports = Test;

