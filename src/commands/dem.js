const Discord = require("discord.js");
const { createCanvas, loadImage } = require('canvas');

const demotivatorImage = async (imgurl, title, subtitle, width, height) => {
  if (width > 850) {
    height = Math.floor((height / (width / 850)));
	width = 850;
  }

  const canvas = createCanvas((width + 60), (height + 120));
  const ctx = canvas.getContext('2d');

  ctx.fillRect(0, 0, (width + 60), (height + 120));
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(27, 17, (width + 5), (height + 5));
  const avatar = await loadImage(imgurl);
  ctx.drawImage(avatar, 29, 19, width, height);

  ctx.font = '42px Times New Roman';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(title, ((width + 60) / 2), (height + 65), (width + 53));
  
  ctx.font = '28px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(subtitle, ((width + 60) / 2), (height + 100), (width + 53));
  const buffer = canvas.toBuffer('image/png');
  return buffer;
}

class Dem {
    constructor(nek){
		this.version = "1.0";

		this.category = "img";
		this.perms = ["EMBED_LINKS", "ATTACH_FILES"];
        this.name = "dem"; // имя команды
		this.desc = "сделать демотиватор"; // описание команды в общем списке команд
		this.advdesc = "Делает демотиватор - изображение, под которым 2 строки текста"; // описание команды в помоще по конкретной команде
		this.args = "<-w> <верхний текст>;<нижний текст>"; // аргументы в общем списке команд
		this.argsdesc = "<верхний текст> и <нижний текст> - содержарие строк, разделяемые `;`\n<-w> - растянет вашу картнку в полтора раза в ширину (множитель 1.5). <-w=x> - где x - множитель растяжения в ширину (`-w=1.5`, `-w=2`, `-w=0.5`)"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<-w> <верхний текст>;<нижний текст>"; // аргументы в помоще по конкретной команде
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

		let wide_multiplier = 1;
		if (args[1]) {
			if (args[1].toLowerCase() == "-w") {
				args.splice(1, 1);
				wide_multiplier = 1.5 ;
			} else if (args[args.length - 1].toLowerCase() == "-w"){
				args.splice((args.length - 1), 1);
				wide_multiplier = 1.5 ;
			} else if (args[args.length - 1].toLowerCase().startsWith("-w=")) {
				wide_multiplier = Number(args[args.length - 1].substring(3).replace(/,/g, "."));
				args.splice((args.length - 1), 1);
				if (isNaN(wide_multiplier) || Math.sign(wide_multiplier) < 0 || wide_multiplier == "") wide_multiplier = 1;
				if (wide_multiplier > 10) wide_multiplier = 10;
			} else if (args[1].toLowerCase().startsWith("-w=")) {
				wide_multiplier = Number(args[1].substring(3).replace(/,/g, "."));
				args.splice(1, 1);
				if (isNaN(wide_multiplier) || Math.sign(wide_multiplier) < 0 || wide_multiplier == "") wide_multiplier = 1;
				if (wide_multiplier > 10) wide_multiplier = 10;
			}
		}
		args.shift(); // режем название команды из аргументов
		let data = args.join(' ').split(';');
		data.push("");
		msg.channel.sendTyping();
		
		const image = await demotivatorImage(attachment[0].attachment, data[0], data[1], Math.floor((attachment[0].width * wide_multiplier)), attachment[0].height);
		await msg.reply({files: [image]});
		return;
    }
}

module.exports = Dem;

