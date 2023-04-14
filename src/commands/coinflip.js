const Discord = require("discord.js")

class coinflip {
    constructor(nek){
		
		this.version = "v1"
		
		this.perms = [];
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
				embed.setTitle('Монетка')
				embed.setColor(nek.config.basecolor)
				embed.setDescription("Ребро! :last_quarter_moon:")
				msg.reply({ embeds: [embed] });
			} else {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle('Монетка')
				embed.setColor(nek.config.basecolor)
				embed.setDescription("Решка! :new_moon:")
				msg.reply({ embeds: [embed] });
			}
		} else {
			let embed = new Discord.EmbedBuilder()
			embed.setTitle('Монетка')
			embed.setColor(nek.config.basecolor)
			embed.setDescription("Орел! :full_moon:")
			msg.reply({ embeds: [embed] });
		}

    }
}

module.exports = coinflip

