const { Telegraf } = require('telegraf');

class GetImage {
	async getImage(nek, msg, outMode){
		//console.log(msg.update.message.photo);
		if (msg.update.message.photo) { // если есть сжатая фотка
			if (!outMode || outMode == "url") {
				const imagelink = await nek.telegram.getFileLink(msg.update.message.photo[(msg.update.message.photo.length - 1)].file_id);
				let outobj = {}
				outobj.link = imagelink.href
				outobj.width = msg.update.message.photo[(msg.update.message.photo.length - 1)].width
				outobj.height = msg.update.message.photo[(msg.update.message.photo.length - 1)].height
				return outobj;
			} else if (outMode == "buffer") {
				// later need to download
				return 'noPhoto';
			} else {
				return 'noPhoto';
			};
		} else {
			return 'noPhoto';
		};
	};
};

module.exports = GetImage;