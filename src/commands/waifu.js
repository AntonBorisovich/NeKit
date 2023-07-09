const Discord = require("discord.js");
const https = require("https");

const nsfwTags = [
	"waifu_nsfw",
	"neko_nsfw",
	"trap",
	"blowjob"
];

const sfwTags = [
	"waifu",
	"neko",
	"shinobu",
	"megumin",
	"bully",
	"cuddle",
	"cry",
	"hug",
	"awoo",
	"kiss",
	"lick",
	"pat",
	"smug",
	"bonk",
	"yeet",
	"blush",
	"smile",
	"wave",
	"highfive",
	"handhold",
	"nom",
	"bite",
	"glomp",
	"slap",
	"kill",
	"kick",
	"happy",
	"wink",
	"poke",
	"dance",
	"cringe"
];

class Waifu {
    constructor(nek){
		this.version = "1.1";
		this.category = "img";

		this.perms = ["EMBED_LINKS", "ATTACH_FILES"];
		this.args = "<тег>";
		this.argsdesc = "```\n" +
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
		"```";
		this.advargs = "<тег>";
        this.desc = "ищет пикчи на waifu.pics";
        this.advdesc = "Отправляет пикчи по тегу с сайта Waifu.pics, в том числе и NSFW";
        this.name = "waifu";
    }
    async run(nek, client, msg, args){
		if (!args[1]) {
			const embed = new Discord.EmbedBuilder()
				.setTitle('Не указан тег')
				.setColor(nek.config.errorcolor)
				.setDescription("Cписок тегов ты можешь посмотреть прописав `" + nek.config.prefix + "help " + this.name + "`");
			await msg.reply({ embeds: [embed] });
			return;
		}
		
		let tag = args[1].toLowerCase();
		let rating;
		if (sfwTags.includes(tag)) {
			rating = 'sfw';
		} else if (nsfwTags.includes(tag)) {
			if (!msg.channel.nsfw) {
				const embed = new Discord.EmbedBuilder()
					.setTitle('Непотребства!')
					.setColor(nek.config.errorcolor)
					.setDescription("Фотокарточки с этим тегом можно посмотреть только в NSFW каналах");
				await msg.reply({ embeds: [embed] });
				return;
			}
			rating = 'nsfw';
		} else {
			const embed = new Discord.EmbedBuilder()
				.setTitle('Неизвестный тег')
				.setColor(nek.config.errorcolor)
				.setDescription("Cписок тегов ты можешь посмотреть прописав `" + nek.config.prefix + "help " + this.name + "`");
			await msg.reply({ embeds: [embed] });
			return;
		}
		

		await https.get("https://api.waifu.pics/" + rating + "/" + tag, async (res) => {
			let body = "";

			res.on("data", async (chunk) => {
				body += chunk;
			});

			res.on("end", async () => {
				const embed = new Discord.EmbedBuilder()
					.setTitle('waifu.pics')
					.setColor(nek.config.basecolor)
					.setDescription(tag)
					.setImage(body.replace(/\{\"url\"\:\"/g, "").replace(/\"/g, "").replace(/\}/g, ""));
				await msg.reply({ embeds: [embed] });
				return;
			});
		}).on("error", async (e) => {
			console.error(e);
			const embed = new Discord.EmbedBuilder()
				.setTitle('Неизвестная ошибка')
				.setColor(nek.config.errorcolor)
				.setDescription(e.name + ": " + e.message);
			await msg.reply({ embeds: [embed] });
			return;
		});
		return;
	}
}

module.exports = Waifu;

