//const { Telegraf } = require('telegraf');

class Format {
	// format
	//  content - тупо текст (string)
	//  embed - работает только для discord-like соц.сетей и просто помещает content в облачко (boolean)
	//  color - HEX код цвета сообщения только для discord-like соц.сетей
	format(content, mode, arg){
		switch(mode) {
			case 'bold':
				return "**" + content + "**";
				break;
			case 'italic':
				return "*" + content + "*";
				break;
			case 'strike':
				return "~~" + content + "~~";
				break;
			case 'underline':
				return "__" + content + "__";
				break;
			case 'spoiler':
				return "||" + content + "||";
				break;
			case 'codeSingleString':
				return "`" + content + "`";
				break;
			case 'codeMultiString':
				//if (!arg) {arg = ""}
				return "```" + arg + "\n" + content + "\n```";
				break;
			case 'hyperlink':
				if (!arg) {return content}; // если нет ссылки то так и оставить
				return "[" + content + "](" + arg + ")";
				break;
			default:
				return content;
				break;
		}
	};
};

module.exports = Format;