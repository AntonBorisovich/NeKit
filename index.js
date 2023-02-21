// New Kitsune (NeKit) // Anton Borisovich
//  Обновлено: смотрите свойства файла index.js
// 
// Пояснения по комментариям:
//  Читаем, считываем - начать чтение переменной, файла
//  Пишем, запоминаем - начать запись переменной, файла
//  Выводим, информируем - начать логирование в консоль или чат
//  Выходим, вылетаем - закрыть процесс node
//
// Да, комментарии на русском ибо в английском я плох и могу написать того, что могу не понять в будущем.

let nek = {} // главная переменная всего бота

// nek.log (state, msg, color, noBrake) - удобный лог в консоль с временем
// 
// Ввод:
//  state - эдакая категория сообщения, например пи ошибке "ERROR", а при обработке чего либо "INFO"
//  msg - основное содержание сообщения
//  color - Меняет цвет строки state. Список возможных цветов смотрите ниже в функции.
//  noBrake - true если надо не пропускать строку в конце. Т.е. следующее сообщение будет на той же строке.
//
// Вывод:
//  YYYY-MM-DD HH:MM:SS [%state%] %msg%
//
nek.log = function(state, msg, color, noBrake) { 
	//  colors (affects only on status)
	// false  - white (normal info)
	// green  -  (success)
	// blue   -  (social's messages)
	// red    -  (errors)
	// yellow -  (warnings)
	if (!color) {
		color = "\x1b[0m"; // reset the color
	} else {
		switch(color) {
			case 'green':
				color = "\x1b[32m"; // FgGreen
				break
			case 'blue':
				color = "\x1b[36m"; // FgCyan
				break
			case 'red':
				color = "\x1b[31m"; // FgRed
				break
			case 'yellow':
				color = "\x1b[33m"; // FgYellow
				break
			default:
				color = "\x1b[0m"; // reset the color
				break
		};
	};

	let date = new Date();
	let hours = date.getHours();
	if (hours < 10) {hours = "0" + hours};
	let mins = date.getMinutes();
	if (mins < 10) {mins = "0" + mins};
	let seconds = date.getSeconds();
	if (seconds < 10) {seconds = "0" + seconds};
	if (!noBrake) { // если мы не хотим печатать на той же строке
		console.log(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds + ' [' + color + state + '\x1b[0m] ' + msg);
	} else { // если мы	хотим печатать на той же строке
		process.stdout.write(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds + ' [' + color + state + '\x1b[0m] ' + msg);
	};
};

// nek.simplelog - более простой лог в консоль ` msg `
//
// Ввод:
//  msg - то, что будет выведено в консоль
//  color - Меняет цвет всей строки. Список возможных цветов смотрите ниже в функции.
//  noBrake - true если надо не пропускать строку в конце. Т.е. следующее сообщение будет на той же строке.
//
// Вывод:
//  msg
nek.simplelog = function(msg, color, noBrake) { // просто вывод строки без состояния и времени
	//  colors (affects only on status)
	// false  - normal info
	// green  - success
	// blue   - social's messages (actually cyan)
	// red    - errors
	// yellow - warnings
	if (!color) {
		color = "\x1b[0m"; // reset the color
	} else {
		switch(color) {
			case 'green':
				color = "\x1b[32m"; // FgGreen
				break
			case 'blue':
				color = "\x1b[36m"; // FgCyan
				break
			case 'red':
				color = "\x1b[31m"; // FgRed
				break
			case 'yellow':
				color = "\x1b[33m"; // FgYellow
				break
			default:
				color = "\x1b[0m"; // reset the color
				break
		};
	};
	if (!noBrake) { // если мы не хотим печатать на той же строке
		console.log(color + msg + '\x1b[0m');
	} else { // если мы	хотим печатать на той же строке
		process.stdout.write(color + msg + '\x1b[0m');
	};
};

nek.log('BOOTLOADER','--=== Bootloader started! ===--'); // информируем, что загрузчик успешно задал основные функции

nek.launch_time = Date.now(); 	// запоминаем время запуска
let config; 					// временная переменная для загрузки конфигов
const os = require('os'); 		// подключение библиотеки получение данных о системе (os)
const fs = require("fs"); 		// подключение библиотеки файловой системы (fs)

// Загрузка информации о загрузчике (метаданные)
nek.log('BOOTLOADER', 'Reading meta...', false, true); // информируем, что начинаем читать файлы метаданных
try { 
	const sysconf = require('./bootmeta.json'); // читаем файл метаданных
	nek.codename = sysconf.codename; // пишем кодовое имя программы
	nek.fullname = sysconf.fullname; // пишеи читаемое имя программы
	nek.apiver = sysconf.apiver; // пишем версию протокола загрузчика с соц. сетями
	nek.version = sysconf.version; // пишем версию загрузчика
	nek.simplelog('OK!', 'green'); // информируем, что метаданные успешно считаны
	nek.log('BOOTLOADER', 'Bootloader meta: ' + nek.fullname + ' (' + nek.codename + ') / Version: ' + nek.version + ' / Commands version: ' + nek.apiver); // для проверки выводим методанные
} catch(e) { // если словили ошибку
	nek.simplelog('ERR!', 'red'); // всё хреново
	console.error(e); // выводим ошибку
	process.exit(1); // выходим
};

// Загрузка пользовательских настроек (конфига)
nek.log('BOOTLOADER', 'Reading config...', false, true); // информируем, что начинаем читать конфиг
try {
	config = require('./config.json'); // читаем файл конфига
	nek.simplelog('OK!', 'green'); // информируем, что конфиг успешно считаны
} catch(e) {
	nek.simplelog('ERR!', 'red'); // всё хреново
	console.error(e); // выводим ошибку
	process.exit(1); // выходим
};

// Чтение аргументов запуска
const args = process.argv.slice(2);
if (args[0]) { // если есть хоть какой-нибудь аргумент, то начать их проверять
	if (args[0].startsWith('--mode=')) { // режим работы (выбор соц. сети)
		nek.log('BOOTLOADER', 'Forced mode to \x1b[36m' + args[0].slice(7).toUpperCase() + "\x1b[0m"); // выводим, что режим работы успешно форсирован (цвет соц. сети выделен синим)
		config.mode = args[0].slice(7); // запоминаем новые режим работы
	};
};

// Проверяем установлен ли режим работы
if (!config.mode) { // если ничего не задано
	nek.log("ERROR", "No mode provided!", "red"); // информируем об ошибке
	process.exit(1); // выходим
}; 

// Проверяем есть ли префикс
if (config.prefix) { // если есть префикс
	nek.prefix = config.prefix;
} else {
	nek.log("ERROR", "No prefix provided!", "red"); // информируем об ошибке
	process.exit(1); // выходим
};
 
// Проверяем есть ли цвет бота
if (config.basecolor) { // если есть цвет
	nek.basecolor = config.basecolor;
} else {
	nek.log("ERROR", "No basecolor provided!", "red"); // информируем об ошибке
	process.exit(1); // выходим
}; 

// Проверяем есть ли имя (не обязательно)
if (config.name) { // если есть имя
	nek.name = config.name;
} else {
	nek.log("WARNING", "No custom name provided! Falling to \"NeKit\"", "yellow"); // информируем о смене имени
	nek.name = "NeKit";
}; 

// Начинаем поиск соц. сети
nek.log('BOOTLOADER', 'Reading \x1b[36m' + config.mode.toUpperCase() + '\x1b[0m...', false, true); // выводим, что мы ищем (цвет соц. сети выделен синим)
fs.readdir("./src/socials/", (e, files)=>{ // читаем папку с соц. сетями
	if (e) throw e; // если чето произошло то пукнуть
	let socConf; // создаем временную переменную с конфигом (social config - socConf)
	try {
		socConf = require('./src/socials/' + config.mode + '/config.json'); // пишем конфиг из файла в переменную
		nek.simplelog('OK!', 'green'); // всё ок
	} catch(e) { // если не удалось считать файл (скорее всего его не существует)
		nek.simplelog('ERR!', 'red'); // всё хреново
		console.error(e); // выводим ошибку
		process.exit(1); // выходим
	};
	
	nek.log("BOOTLOADER", "Loaded config for \x1b[36m" + socConf.name.toUpperCase() + "\x1b[0m (v" + socConf.version + " made by " + socConf.author + ")"); // сообщить, если конфиг соц. сети успешно записан в переменную
	if (socConf.version == nek.apiver) { // если версия протокола соц. сети и загрузчика совпадают то работать
		nek.log("BOOTLOADER", "Loading main...", false, true);
		let socMain; // создаем переменную основной функции соц. сети (social main - socMain)
		try {
			const socMainPrototype = require('./src/socials/' + config.mode + '/' + socConf.functions.main.name + '.js'); // читаем файл во временную переменную
			socMain = new socMainPrototype(nek, config); // вытаскиваем из файла функцию main
		} catch(e) {
			nek.simplelog('ERR!', 'red'); // всё хреново
			console.error(e); // выводим ошибку
			process.exit(1); // выходим
		};
		nek.simplelog('OK!','green'); // всё ок
		nek.log("BOOTLOADER", "Executing autorun...", false, true);
		const startupStatus = socMain.autorun(nek, config); // запускаем авторан
		if (startupStatus == 'done') { // если авторан успешно завершил операцию
			nek.simplelog('OK!','green'); // всё ок
			
			let nekLite = nek; // запоминаем переменную nek до введения в неё функций и команд
			
			nek.log("BOOTLOADER", "Loading functions...", false, true);
			fs.readdir("./src/socials/"+config.mode, (e, files) => { // смотрим папку соц. сети
				if (e) throw e; // если чето произошло то пукнуть
				for ( const file of files ) { // перебираем файлы в папке
					try {
						if (file.endsWith(".js") && file != "commands" && file != "main.js" && file != "config.json") { // если .js и не main и не config то работать
							let fileName = file.substring(0,file.length-3); // сокращаем .js
							let funcPrototype = require("./src/socials/" + config.mode + "/" + fileName); // читаем файл
							let func = new funcPrototype(nekLite, config); // вытаскиваем из файла функцию
							eval('nek.' + fileName + ' =  func.' + fileName); // пишем функцию в переменную (nek.имя_файла)
						};
					} catch(e) { // если не удалось что-то считать
						nek.simplelog('ERR!','red');
						nek.log("ERROR", "Failed to read " + file + "!", "red");
						console.error(e);
						process.exit(1);
					};
				};
			});
			nek.simplelog('OK!','green');
 			nek.log("BOOTLOADER", "Loading commands...", false, true);
			fs.readdir("./src/commands/", (e, files) => { // смотрим папку с командами
				if (e) throw e; // если чето произошло то пукнуть
				nek.commands = []; // глобальный массив с командами
				for ( const file of files ) { 
					try {
						if (file.endsWith(".js")) { // если .js то работать
							let fileName = file.substring(0,file.length-3);
							let cmdPrototype = require("./src/commands/"+fileName); // читаем файл
							let command = new cmdPrototype(nekLite, config); // вытаскиваем из файла функцию
							nek.commands.push(command); // запись функции в глобальный список
						};
					} catch(e) {
						nek.simplelog('ERR!','red');
						nek.log("ERROR", "Failed to read " + file + "!", "red");
						console.error(e);
						process.exit(1);
					};
				};
				nek.simplelog('OK!', 'green');
				nek.log("BOOTLOADER", "Started \x1b[36m" + socConf.name.toUpperCase() + "\x1b[0m"); // информируем, что начинается запуск соц. сети
				socMain.work(nek, config);
			});
		} else { // если авторан завершил операцию с ошибкой
			nek.simplelog('ERR!', 'red'); // всё хреново
			nek.log("ERROR", "Autorun returned error: " + startupStatus, "red");
			process.exit(1);
		};
	} else {
		nek.log("ERROR", "Uncompatible socail veriosn!", "red");
		process.exit(1);
	};
});