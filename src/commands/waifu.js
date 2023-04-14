const Discord = require("discord.js")
const https = require("https");

class waifu {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
		this.test = true; 
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "img";
		this.args = "<тег>";
		this.advargs = "```\n" +
		"-= SFW =- | -= NSFW =-\n"+
		"waifu     | waifu_NSFW\n"+
		"neko      | neko_NSFW\n"+
		"shinobu   | trap\n"+
		"megumin   | blowjob\n"+
		"bully     | \n"+
		"cuddle    | \n"+
		"cry       | \n"+
		"hug       | \n"+
		"awoo      | \n"+
		"kiss      | \n"+
		"lick      | \n"+
		"pat       | \n"+
		"smug      | \n"+
		"bonk      | \n"+
		"yeet      | \n"+
		"blush     | \n"+
		"smile     | \n"+
		"wave      | \n"+
		"highfive  | \n"+
		"handhold  | \n"+
		"nom       | \n"+
		"bite      | \n"+
		"glomp     | \n"+
		"slap      | \n"+
		"kill      | \n"+
		"kick      | \n"+
		"happy     | \n"+
		"wink      | \n"+
		"poke      | \n"+
		"dance     | \n"+
		"cringe    | \n"+
		"-= SFW =- | -= NSFW =-\n"+
		"```"
		this.usage = "<тег>";
        this.desc = "кидает пикчи с waifu.pics";
        this.advdesc = "Отправляет пикчи по тегу с сайта Waifu.pics, в том числе и NSFW";
        this.name = "waifu";
    }
    async run(nek, client, msg, args){
		var executed = false
		
		var nsfw = ["waifu_nsfw" , "neko_nsfw", "trap", "blowjob"]
		await nsfw.forEach(tag => {
			if (args[1]) {
				if (tag.toLowerCase() == args[1].toLowerCase()) {
					executed = true
					if (msg.channel.nsfw) {
						let tagg = args[1].replace(/_nsfw/g, "")
						var url = "https://api.waifu.pics/nsfw/" + tagg;
						https.get(url, function(res) {
							var body = "";

							res.on("data", function(chunk) {
								body += chunk;
							});
	 
							res.on("end", function() {
								let embed = new Discord.EmbedBuilder()
								embed.setTitle(client.user.username + ' - waifu')
								embed.setColor(`#F36B00`)
								embed.setDescription(tag)
								embed.setImage(body.replace(/\{\"url\"\:\"/g, "").replace(/\"/g, "").replace(/\}/g, ""))
								msg.channel.send({ embeds: [embed] });;
								return
							});
						}).on("error", function(e) {
							return
						});
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(client.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Этот тег можно использовать только в NSFW каналах!")
						msg.channel.send({ embeds: [embed] });
					}
				}
			}
		})
		var sfw = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"]
		await sfw.forEach(tag => {
			if (args[1]) {
				if (tag == args[1].toLowerCase()) {
					executed = true
					var url = "https://api.waifu.pics/sfw/" + tag;
					https.get(url, function(res) {
						var body = "";

						res.on("data", function(chunk) {
							body += chunk;
						});
	 
						res.on("end", function() {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(client.user.username + ' - waifu')
							embed.setColor(`#F36B00`)
							embed.setDescription(tag)
							embed.setImage(body.replace(/\{\"url\"\:\"/g, "").replace(/\"/g, "").replace(/\}/g, ""))
							msg.channel.send({ embeds: [embed] });;
							return
						});
					}).on("error", function(e) {
						return
					});
				}
			}
		})
		if (!executed) {
			if (!args[1] || args[1] == "") {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Ты не указал тег\n\nCписок тегов ты можешь посмотреть в " + nek.config.prefix + "help " + this.name)
				msg.channel.send({ embeds: [embed] });;
			} else {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Тег не найден\n\nCписок тегов ты можешь посмотреть в " + nek.config.prefix + "help " + this.name)
				msg.channel.send({ embeds: [embed] });;
			}
		}
	}
}

module.exports = waifu

