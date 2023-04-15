const Discord = require("discord.js");
const { createCanvas, loadImage } = require('canvas');
const leftpic = 'src/assets/look/left.png';
const rightpic = 'src/assets/look/right.png';

const LookAtThisImage = async (imgurl, width, height) => {

  // downscaling input image
  
  // by height
  if (height > 305) {
	//console.log("before " + width + "x" + height)
    width = Math.floor((width / (height / 305)));
	height = 305;
	//console.log("after " + width + "x" + height)
  };
  
  // by width
  if (width > 850) {
	//console.log("before " + width + "x" + height)
    height = Math.floor((height / (width / 850)));
	width = 850;
	//console.log("after " + width + "x" + height)
  }
  
  // upscaling if too small
  // TODO
 
  // picture settings
  const canvas = createCanvas((width + 576), 512);
  const ctx = canvas.getContext('2d');
  
  // bg
  ctx.fillStyle = '#fff'; // choosing bg color
  ctx.fillRect(0, 0, (width + 576), 512); // drawing bg
  
  // left dude
  const leftpicbuf = await loadImage(leftpic); // loading left dude
  ctx.drawImage(leftpicbuf, 0, 0, 229, 512); // drawing left dude
  
  // pic
  const avatar = await loadImage(imgurl); // loading user's pic
  ctx.drawImage(avatar, 249 , (150 - height/2), width, height); // drawing user's pic
  
  // right dude
  const rightpicbuf = await loadImage(rightpic); // loading right dude
  ctx.drawImage(rightpicbuf, (269 + width) , 0, 309, 512); // drawing right dude
  
  // sending
  const buffer = canvas.toBuffer('image/png'); // setting output format
  return buffer; // sending back
}

class Look {
    constructor(nek){
		this.version = '1.0';
		this.category = "img";
		
		this.perms = ["EMBED_LINKS", "ATTACH_FILES"];
        this.name = "look"; // имя команды
		this.desc = "2 чела показывают на пикчу"; // описание команды в общем списке команд
		this.advdesc = "Делает мем, где 2 нарисованых чела показывают на картинку\nПодробнее: [knowyourmeme.com](https://knowyourmeme.com/memes/two-soyjaks-pointing)"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = "<-w> - растянет вашу картнку в полтора раза (множитель 1.5). <-w=x> - где x - множитель растяжения в ширину (`-w=1.5`, `-w=2`, `-w=0.5`)"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<-w>"; // аргументы в помоще по конкретной команде
    }

    async run(nek, kitsune, msg, args){
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

		msg.channel.sendTyping();
		const image = await LookAtThisImage(attachment[0].attachment, Math.floor((attachment[0].width * wide_multiplier)), attachment[0].height);
		const imageName = attachment[0].name;
		const finalImage = new Discord.AttachmentBuilder(image, { name: 'look_at_' + imageName.substring(0,imageName.length-4) + '.png' });
		await msg.reply({files: [finalImage]});
		return;
    };
};

module.exports = Look;

