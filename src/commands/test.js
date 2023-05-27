const Discord = require("discord.js");
const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');

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

    async run(nek, client, msg, args){
		args.shift();
		
		return;
		const types = ['bus', 'tram', 'trolley']
		const sizes = [0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,255,270,285,300,315,330,345,360]
		for (const type of types) {
			console.log('starting processing type "' + type + '"')
			for (const size of sizes) {
				const canvas = createCanvas(64, 64);
				const ctx = canvas.getContext('2d');
				const imgurl = './src/assets/orgp/' + type + '_rotatable.png'
				const avatar = await loadImage(imgurl);
				ctx.translate(canvas.width/2,canvas.height/2);
				ctx.rotate(size*Math.PI/180);
				ctx.drawImage(avatar, -32, -32);
				
				const buffer = canvas.toBuffer('image/png');
				await fs.writeFile(type + "_" + size + ".png", buffer, (err) => { // пишем новый файл
					if (err) throw(err);
				});
				console.log('saved as "' + type + '_' + size + '.png"');
			}
		}
		
		return;
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

