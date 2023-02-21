//const { Telegraf } = require('telegraf');

class Format {
	// format
	//  content - тупо текст (string)
	//  embed - работает только для discord-like соц.сетей и просто помещает content в облачко (boolean)
	//  color - HEX код цвета сообщения только для discord-like соц.сетей
	format(content, mode, arg){
		switch(mode) {
			case 'bold':
				return "<b>" + content + "</b>";
				break;
			case 'italic':
				return "<i>" + content + "</i>";
				break;
			case 'strike':
				return "<s>" + content + "</s>";
				break;
			case 'underline':
				return "<u>" + content + "</u>";
				break;
			case 'spoiler':
				return "<tg-spoiler>" + content + "</tg-spoiler>";
				break;
			case 'codeSingleString':
				return "<code>" + content + "</code>";
				break;
			case 'codeMultiString':
				return "<code>" + content + "</code>";
				break;
			case 'hyperlink':
				if (!arg) {return content}; // если нет ссылки то так и оставить
				return "<a href=" + arg + ">" + content + "</a>";
				break;
			default:
				return content;
				break;
		};
	};
};

module.exports = Format;