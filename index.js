let nek = {} // главная переменная всего бота

nek.log = function(state, msg) { // удобный лог
	let date = new Date();
	let hours = date.getHours();
	if (hours < 10) {hours = "0" + hours};
	let mins = date.getMinutes();
	if (mins < 10) {mins = "0" + mins};
	let seconds = date.getSeconds();
	if (seconds < 10) {seconds = "0" + seconds};
	console.log(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds + ' [' + state + '] ' + msg);
};

nek.log('BOOTLOADER','--=== Bootloader started! ===--');

const launch_time = Date.now(); // запоминаем время запуска
let config 						// временная переменная для загрузки конфигов
const os = require('os'); 		// подключение библиотеки получение данных о системе (os)
const fs = require("fs"); 		// подключение библиотеки файловой системы (fs)

// Загрузка информации о загрузчике
nek.log('BOOTLOADER', 'Reading meta...');
try {
	const sysconf = require('./bootmeta.json');
	nek.codename = sysconf.codename
	nek.fullname = sysconf.fullname
	nek.apiver = sysconf.apiver
	nek.version = sysconf.version
	nek.log('BOOTLOADER', 'Bootloader meta: ' + nek.fullname + ' (' + nek.codename + ') / Version: ' + nek.version + ' / Commands version: ' + nek.apiver)
} catch(e) {
	nek.log('ERROR', 'Failed to load the metadata! (' + e.code + ')');
	process.exit(1);
}

// Загрузка основного конфига
nek.log('BOOTLOADER', 'Reading config...');
try {
	config = require('./config.json'); // читаем файл конфига
	
} catch(e) {
	nek.log('ERROR', 'Failed to load config! ' + e.code);
	nek.log('BOOTLOADER', 'You can generate config by opening configure.bat (nah, maybe later i\'ll do it)');
	process.exit(1);
}

// Чтение аргументов запуска
const args = process.argv.slice(2);
if (args[0]) {
	if (args[0].startsWith('--mode=')) {
		nek.log('BOOTLOADER', 'Forcing mode to ' + args[0].slice(7))
		config.mode = args[0].slice(7);
	};
};

// Проверяем установлен ли режим работы
if (!config.mode) { nek.log("ERROR", "No mode provided!"); process.exit(1); };

// Начинаем поиск соц. сети
nek.log('BOOTLOADER', 'Looking for ' + config.mode + '...');
fs.readdir("./src/socials/", (err, files)=>{ // читаем папку
	if (err) throw err;
	let socConf; // создаем временную переменную с конфигом
	try {
		socConf = require('./src/socials/' + config.mode + '/config.json'); // записываем конфиг в переменную
	} catch(e) {
		nek.log("ERROR", "Failed to load " + config.mode + "'s config file! Make sure that it exists!");
	};
	
	nek.log("BOOTLOADER", "Loaded config for " + socConf.name + " (v" + socConf.version + " made by " + socConf.author + ")"); // сообщить, если конфиг соц. сети успешно загрузился
	if (socConf.functions.main) { // если в конфиге есть основная функция то работать
		nek.log("BOOTLOADER", "Loading main...");
		const socMainPrototype = require('./src/socials/' + config.mode + '/' + socConf.functions.main.name + '.js');
		const socMain = new socMainPrototype(nek, config);
		nek.log("BOOTLOADER", "Executing autorun...");
		const startupStatus = socMain.startup(nek, config); // запускаем авторан
		if (startupStatus == 'done') { // если запуск успешен
			nek.log("BOOTLOADER", "Loading functions...");
			fs.readdir("./src/socials/"+config.mode, (err, files) => { // смотрим папку
				if (err) throw err;
				for ( const file of files ) { // перебираем файлы в папке
					try {
						if (file.endsWith(".js") && file != "commands" && file != "main.js" && file != "config.json") { // если .js и не main и не config то работать
							let fileName = file.substring(0,file.length-3); // сокращаем .js
							let fncPrototype = require("./src/socials/" + config.mode + "/" + fileName); // читаем файл
							let func = new fncPrototype(nek, config); // вытаскиваем из файла функцию
							eval('nek.' + fileName + ' =  func'); // пишем функцию в переменную (nek.имя_файла)
						};
					} catch(err) {
						nek.log("ERROR", "Failed to load " + file + "! Look below for more info:");
						console.error(err);
						process.exit(1);
					};
				};
			});
			nek.log("BOOTLOADER", "Loading commands...");
			fs.readdir("./src/commands/", (err, files) => {
				if (err) throw err;
				nek.commands = []
				for ( const file of files ) { 
					try {
						if (file.endsWith(".js")) { // если .js то работать
							let fileName = file.substring(0,file.length-3);
							let cmdPrototype = require("./src/commands/"+fileName); // читаем файл
							let command = new cmdPrototype(nek, config); // вытаскиваем из файла функцию
							nek.commands.push(command); // запись функции в глобальный список
						};
					} catch(err) {
						console.error(err);
					};
				};
				nek.log("BOOTLOADER", "Executing " + socConf.name + "'s main function...");
				socMain.work(nek, config);
			});
		} else {
			nek.log("ERROR", "Autorun returned error: " + startupStatus);
			process.exit(1);
		};
	} else {
		nek.log("ERROR", "Main function not found!");
		process.exit(1);
	};
});
//nek.log("ERROR", "Main function not found!");