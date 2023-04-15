const Discord = require("discord.js");
const { createCanvas, loadImage } = require('canvas');

const lobsteru = async (imgurl, title, width, height) => {
  if (width > 800) {
    height = (height / (width / 800));
	width = 800;
  }
  if (width < 100) {
    height = (height / (width / 100));
	width = 100;
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const avatar = await loadImage(imgurl);
  ctx.drawImage(avatar, 0, 0, width, height);
  
  let gradient = ctx.createLinearGradient(0, (height - 60), 0, height);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)");
  gradient.addColorStop(2, "rgba(0, 0, 0, 0.9)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  ctx.font = '38px Lobster';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(title, (width / 2), (height - 17), (width - 8));

  const buffer = canvas.toBuffer('image/png');
  return buffer;
}

class Lobster {
    constructor(nek){
		this.version = "1.0";
		this.category = "img";
		
		this.perms = ["EMBED_LINKS", "ATTACH_FILES"];
		this.args = "<текст>";
		this.advargs = "<текст> - содержарие строки";
		this.argsdesc = this.advargs; // описание аргументов в помоще по конкретной команде
        this.desc = "сделать мем с лобстером как в вк";
		this.advdesc = 'Пикча с текстом, написанным шрифтом "Lobster", что и дает название мема\n\nВывод изображения ограничен в ширину до 800 пикселей';
        this.name = "lobster";
    }

    async run(nek, client, msg, args){
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
		
		args.shift(); // режем название команды из аргументов
		const data = args.join(' ');
		args.push("");
		msg.channel.sendTyping();
		
		const image = await lobsteru(attachment[0].attachment, data, attachment[0].width, attachment[0].height);
		await msg.reply({files: [image]});
		return;
	};
};

module.exports = Lobster;

