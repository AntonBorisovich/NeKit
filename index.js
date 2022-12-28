function getTimestamp() {
	var date = new Date();
	var hours = date.getHours()
	if (hours < 10) {
		hours = "0" + hours
	}
	var mins = date.getMinutes()
	if (mins < 10) {
		mins = "0" + mins
	}
	var seconds = date.getSeconds()
	if (seconds < 10) {
		seconds = "0" + seconds
	}
	var result = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds
	return result
}

console.log(getTimestamp() + " [INFO] New Kitsune (NeKit) started booting!")
const launch_time = Date.now(); // запоминаем время запуска
const os = require('os'); // подключение библиотеки получение данных о системе (os)
const fs = require("fs"); // подключение библиотеки файловой системы (fs)
console.log(getTimestamp() + ' [INFO] Running node ' + process.version + ' on ' + os.platform() + ' with ' + Math.floor((os.totalmem() / 1048576)) + 'MB of RAM')



// Начало инициализации
console.log(getTimestamp() + ' [INFO] Reading config...');
let config
let nek = {}
try {
	config = require('./config.json');
} catch(e) {
	console.log(getTimestamp() + ' [ERROR] Failed to load config! ' + e.code);
	console.log(getTimestamp() + ' [INFO] You can generate config by opening configure.bat ');
	process.exit(1);
}

// Обрабатываем режим дебага
nek.debug = config.debug
if (nek.debug) { console.log(getTimestamp() + " [INFO] Debug mode activated") };

// Обрабатываем режим работы
if (!config.mode) { console.log(getTimestamp() + " [ERROR] You need to provide social in config"); process.exit(1); }

//debug.log()


console.log(getTimestamp() + ' [INFO] Reading social mode...');
let mode
fs.readdir("./src/socials/", (err, files)=>{
	if (err) throw err;
	let social = false;
	for ( const file of files ) { // перебрать все файлы
		try {
			if (file == config.mode) { social = file };
		} catch(err) { // при ошибке лог
			console.error(err);
		};
	};
	if (!social) {
		console.log(getTimestamp() + " [ERROR] Social " + config.mode + " not found");
		process.exit(1);
	};
	const socconf = require('./src/socials/' + config.mode + '/config.json');
	
	
})

return;




// склад модулей
let commands = [];  // команды

let errors = [];    // список ошибок, произошедших во время инициализации