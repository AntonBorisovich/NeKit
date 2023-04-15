const Discord = require("discord.js");

class coinflip {
    constructor(nek){
		
		this.version = "1.0";
		
		this.perms = ["EMBED_LINKS"];
		this.category = "fun";
		this.args = "";
		this.advargs = "";
		this.usage = "";
        this.desc = "подкинуть монетку";
        this.advdesc = "Простой рандомайзер. Шансы 50/50 для орла и решки, но монетка может упасть и ребром";
        this.name = "coinflip";
    }

    run(nek, client, msg, args){
		const random = Math.floor(Math.random() * (1005));
		if (random > 500) {
			if (random > 1000) {
				let embed = new Discord.EmbedBuilder()
					.setTitle('Монетка')
					.setColor(nek.config.basecolor)
					.setDescription("Ребро! :last_quarter_moon:")
				msg.reply({ embeds: [embed] });
				return;
			} else {
				let embed = new Discord.EmbedBuilder()
					.setTitle('Монетка')
					.setColor(nek.config.basecolor)
					.setDescription("Решка! :new_moon:")
				msg.reply({ embeds: [embed] });
				return;
			}
		} else {
			let embed = new Discord.EmbedBuilder()
				.setTitle('Монетка')
				.setColor(nek.config.basecolor)
				.setDescription("Орел! :full_moon:")
			msg.reply({ embeds: [embed] });
			return;
		}

    }
}

module.exports = coinflip;

