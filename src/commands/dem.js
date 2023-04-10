const { createCanvas, loadImage } = require('canvas')

const demotivatorImage = async (img, title, subtitle, width, height) => {
  if (width > 850) {
	//console.log("before " + width + "x" + height)
    height = Math.floor((height / (width / 850)))
	width = 850
	//console.log("after " + width + "x" + height)
  }
  const canvas = createCanvas((width + 60), (height + 120))
  const ctx = canvas.getContext('2d')

  //const image = await loadImage(bg)
  //ctx.drawImage(image, 0, 0)
  ctx.fillRect(0, 0, (width + 60), (height + 120))
  ctx.strokeStyle = '#fff'
  ctx.strokeRect(27, 17, (width + 5), (height + 5))
  const avatar = await loadImage(img)
  ctx.drawImage(avatar, 29, 19, width, height)

  ctx.font = '42px Times New Roman'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.fillText(title, ((width + 60) / 2), (height + 65), (width + 53))
  
  ctx.font = '28px Arial'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.fillText(subtitle, ((width + 60) / 2), (height + 100), (width + 53))
  const buffer = canvas.toBuffer('image/png')
  return buffer
}

class Dem {
    constructor(nek, config){
		this.category = "image"; // категория команд
		this.hidden = false; // можно ли отображать команду в общем списке
		
		this.perms = ["image"];
        this.name = "dem"; // имя команды
		this.desc = "сделать демотиватор"; // описание команды в общем списке команд
		this.advdesc = "Делает демотиватор - изображение, под которым 2 строки текста"; // описание команды в помоще по конкретной команде
		this.args = "&lt-w&gt &ltверхний текст&gt;&ltнижний текст&gt"; // аргументы в общем списке команд
		this.argsdesc = "&ltверхний текст&gt и &ltнижний текст&gt - содержарие строк, разделяемые `;`\n&lt-w&gt - растянет вашу картнку в полтора раза в ширину (множитель 1.5). &lt-w=x&gt - где x - множитель растяжения в ширину (`-w=1.5`, `-w=2`, `-w=0.5`)"; // описание аргументов в помоще по конкретной команде
		this.advargs = "&lt-w&gt &ltверхний текст&gt;&ltнижний текст&gt"; // аргументы в помоще по конкретной команде
    }

    async run(nek, client, msg, args){
		const pic = await nek.getImage(nek, msg, 'url')
		console.log(pic)
		
		let wide_multiplier = 1
		// if (args[0]) {
			// if (args[0].toLowerCase() == "-w") {
				// args.splice(1, 1)
				// wide_multiplier = 1.5 
			// } else if (args[args.length - 1].toLowerCase() == "-w"){
				// args.splice((args.length - 1), 1)
				// wide_multiplier = 1.5 
			// } else if (args[args.length - 1].toLowerCase().startsWith("-w=")) {
				// wide_multiplier = Number(args[args.length - 1].substring(3).replace(/,/g, "."))
				// args.splice((args.length - 1), 1)
				// if (isNaN(wide_multiplier) || Math.sign(wide_multiplier) < 0 || wide_multiplier == "") {wide_multiplier = 1}
				// if (wide_multiplier > 10) {wide_multiplier = 10}
			// } else if (args[0].toLowerCase().startsWith("-w=")) {
				// wide_multiplier = Number(args[1].substring(3).replace(/,/g, "."))
				// args.splice(1, 1)
				// if (isNaN(wide_multiplier) || Math.sign(wide_multiplier) < 0 || wide_multiplier == "") {wide_multiplier = 1}
				// if (wide_multiplier > 10) {wide_multiplier = 10}
			// }
		// }
		let data = args.join(' ').split(';');
		data.push("")
		
		const img = await demotivatorImage(pic.link, data[0], data[1], Math.floor(pic.width * wide_multiplier), pic.height)
		await nek.send("", msg, {filetype: 'image', storetype: 'buffer', image: img})
		return;
	}
}

module.exports = Dem

