// New Kitsune (NeKit) bootloader // Anton Borisovich
//  Обновлено: смотрите свойства файла index.js

// Пояснения по комментариям:
//  Читаем, считываем - начать чтение переменной, файла
//  Пишем, запоминаем - начать запись переменной, файла
//  Выводим, информируем - начать логирование в консоль или чат
//  Выходим, вылетаем - закрыть процесс node

// Порядок инициализации загрузчика:
//  - Чтение информации о загрузчике (bootmeta.json)
//  - Чтение пользовательских настроек (config.json)
//  - Проверка аргументов запуска и правильности составления файла настроек
//  - Чтение команд (src/commands/*.js)
//  - Исполнение функции social (из файла соц. сети, например discord.js)
//  -- Дальшнейшую работу делает соц. сеть, загрузчик закончил свою работу

// Да, все комментарии на русском ибо в английском я плох и могу написать того, что не смогу понять в будущем.

let nek = {}; // главная переменная всего бота

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
nek.log = async (state, msg, color, noBrake) => { 
	//  colors (affects only on status)
	// false  - white (normal info)
	// green  -  (success)
	// blue   -  (social's messages)
	// red    -  (errors)
	// yellow -  (warnings)
	switch(color) {
		case 'black':
			color = "\x1b[30m"; // FgBlack
			break
		case 'red':
			color = "\x1b[31m"; // FgRed
			break
		case 'green':
			color = "\x1b[32m"; // FgGreen
			break
		case 'yellow':
			color = "\x1b[33m"; // FgYellow
			break
		case 'blue':
			color = "\x1b[34m"; // FgBlue
			break
		case 'magenta':
			color = "\x1b[35m"; // FgMagenta
			break
		case 'cyan':
			color = "\x1b[36m"; // FgCyan
			break
		case 'gray':
			color = "\x1b[90m"; // FgGray
			break
		default:
			color = "\x1b[0m"; // reset the color
			break
	}

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
	}
}

// nek.simplelog - более простой лог в консоль ` msg `
//
// Ввод:
//  msg - то, что будет выведено в консоль
//  color - Меняет цвет всей строки. Список возможных цветов смотрите ниже в функции.
//  noBrake - true если надо не пропускать строку в конце. Т.е. следующее сообщение будет на той же строке.
//
// Вывод:
//  %msg%
nek.simplelog = async (msg, color, noBrake) => { // просто вывод строки без состояния и времени
	//  colors (affects only on status)
	// false  - normal info
	// green  - success
	// blue   - social's messages (actually cyan)
	// red    - errors
	// yellow - warnings
	switch(color) {
		case 'black':
			color = "\x1b[30m"; // FgBlack
			break
		case 'red':
			color = "\x1b[31m"; // FgRed
			break
		case 'green':
			color = "\x1b[32m"; // FgGreen
			break
		case 'yellow':
			color = "\x1b[33m"; // FgYellow
			break
		case 'blue':
			color = "\x1b[34m"; // FgBlue
			break
		case 'magenta':
			color = "\x1b[35m"; // FgMagenta
			break
		case 'cyan':
			color = "\x1b[36m"; // FgCyan
			break
		case 'gray':
			color = "\x1b[90m"; // FgGray
			break
		default:
			color = "\x1b[0m"; // reset the color
			break
	}
	if (!noBrake) { // если мы не хотим печатать на той же строке
		console.log(color + msg + '\x1b[0m');
	} else { // если мы	хотим печатать на той же строке
		process.stdout.write(color + msg + '\x1b[0m');
	}
}

nek.log('BOOTLOADER', '--=== Bootloader started! ===--'); // информируем, что загрузчик успешно задал основные функции

nek.launch_time = Date.now(); 	// запоминаем время запуска
let config; 					// временная переменная для загрузки конфигов
const os = require('os'); 		// подключение библиотеки получение данных о системе (os)
const fs = require("fs/promises"); 		// подключение библиотеки файловой системы (fs)



// Загрузка информации о загрузчике (метаданные)
nek.log('BOOTLOADER', 'Reading meta...', false, true); // информируем, что начинаем читать файлы метаданных
try { 
	const sysconf = require('./bootmeta.json'); // читаем файл метаданных
	nek.codename = sysconf.codename; // пишем кодовое имя программы
	nek.fullname = sysconf.fullname; // пишеи читаемое имя программы
	nek.version = sysconf.version; // пишем версию загрузчика
	nek.simplelog('OK!', 'green'); // информируем, что метаданные успешно считаны
	nek.log('BOOTLOADER', 'Bootloader meta: ' + nek.fullname + ' (' + nek.codename + ') / Version: ' + nek.version + ' / Commands version: ' + nek.apiver); // для проверки выводим методанные
} catch(e) { // если словили ошибку
	nek.simplelog('ERR!', 'red'); // всё хреново
	console.error(e); // выводим ошибку
	process.exit(1); // выходим
}

// Загрузка пользовательских настроек (конфига)
nek.log('BOOTLOADER', 'Reading config...', false, true); // информируем, что начинаем читать конфиг
try {
	config = require('./config.json'); // читаем файл конфига
	nek.simplelog('OK!', 'green'); // информируем, что конфиг успешно считаны
} catch(e) {
	nek.simplelog('ERR!', 'red'); // всё хреново
	console.error(e); // выводим ошибку
	process.exit(1); // выходим
}

//Чтение аргументов запуска
const args = process.argv.slice(2);
if (args[0]) { // если есть хоть какой-нибудь аргумент, то начать их проверять
	for (const arg of args) { 
	
		// TODO: Переделать так, что бы можно было считать любой аргумент, который имеет '=' и записать в конфиг, а не только заданные тут.
		if (arg.startsWith('--soc=')) { // соц. сеть
			config.socfile = arg.slice(6); // записать новый socfile
			nek.log('ARGUMENT', 'Forcing socfile to: ' + config.socfile, 'cyan'); // выводим, что режим работы форсирован
			break;
		}
		if (arg.startsWith('--color=')) { // цвет
			config.basecolor = arg.slice(8); // записать новый basecolor
			nek.log('ARGUMENT', 'Forcing basecolor to: ' + config.basecolor, 'cyan'); // выводим, что цвет форсирован
			break;
		}
		if (arg.startsWith('--prefix=')) { // префикс
			config.prefix = arg.slice(9); // записать новый prefix
			nek.log('ARGUMENT', 'Forcing prefix to: ' + config.prefix, 'cyan'); // выводим, что префикс форсирован
			break;
		}
		if (arg.startsWith('--name=')) { // имя
			config.prefix = arg.slice(7); // записать новый name
			nek.log('ARGUMENT', 'Forcing name to: ' + config.name, 'cyan'); // выводим, что имя форсировано
			break;
		}
		
		if (arg.startsWith('--noDmErrors')) { // не пытаться отправлять ошибки в лс
			config.noDmErrors = true;
			nek.log('ARGUMENT', 'Forcing not to send errors in dm', 'cyan');
			break;
		}
	}
}

// Проверяем установлен ли режим работы
if (!config.socfile) { // если ничего не задано
	nek.log("ERROR", "No socfile provided! Falling to discord", "yellow"); // информируем о смене socfile-а
	config.socfile = 'discord';
}

// Проверяем есть ли префикс
if (config.prefix) { // если есть префикс
	nek.prefix = config.prefix;
} else {
	nek.log("ERROR", "No prefix provided!", "red"); // информируем об ошибке
	process.exit(1); // выходим
}
 
// Проверяем есть ли цвет бота
if (config.basecolor) { // если есть цвет
	nek.basecolor = config.basecolor;
} else {
	nek.log("ERROR", "No basecolor provided! Falling to \"#FFFFFF\"", "yellow"); // информируем о смене цвета
	nek.basecolor = "#FFFFFF"; // меняем цвет
}

// Проверяем есть ли имя
if (config.name) { // если есть имя
	nek.name = config.name;
} else {
	nek.log("WARNING", "No custom name provided! Falling to \"NeKit\"", "yellow"); // информируем о смене имени
	nek.name = "NeKit"; // меняем имя
}

// Читаем функции
async function loadFunctions() {
	nek.log('BOOTLOADER', 'Loading functions...', false, true);
	let nekFuncs = new Map(); // создаём мапу функций
	let funcErrs = []; // создаём массив ошибок
	const dir = await fs.readdir('./src/functions/'); // смотрим папку с командами
	for ( const file of dir ) { 
		try {
			if (file.endsWith(".js")) { // если .js то работать
				let fileName = file.substring(0,file.length-3);
				let fncPrototype = require("./src/functions/"+fileName); // читаем файл
				let func = new fncPrototype(nek, config); // вытаскиваем из файла функцию
				nekFuncs.set(func.name, func); // пишем команду в мапу
				//nek.simplelog('Loaded some!', 'cyan');
			}
		} catch(e) {
			//nek.simplelog('ERR!','red');
			//nek.log("ERROR", "Failed to read " + file + "!", "red");
			//console.error(e);
			funcErrs.push({'file': file, 'error': e});
		}
	}
	return {'map': nekFuncs, 'errors': funcErrs};
}
// Читаем команды
async function loadCommands() {
	nek.log('BOOTLOADER', 'Loading commands...', false, true);
	let nekComms = new Map(); // создаём мапу команд
	let commErrs = []; // создаём массив ошибок
	const dir = await fs.readdir('./src/commands/'); // смотрим папку с командами
	for ( const file of dir ) { 
		try {
			if (file.endsWith(".js")) { // если .js то работать
				let fileName = file.substring(0,file.length-3);
				let cmdPrototype = require("./src/commands/"+fileName); // читаем файл
				let command = new cmdPrototype(nek, config); // вытаскиваем из файла функцию
				nekComms.set(command.name, command); // пишем команду в мапу
				//nek.simplelog('Loaded some!', 'magenta');
			}
		} catch(e) {
			//nek.simplelog('ERR!','red');
			//nek.log("ERROR", "Failed to read " + file + "!", "red");
			//console.error(e);
			commErrs.push({'file': file, 'error': e});
		}
	}
	return {'map': nekComms, 'errors': commErrs}
}
(async () => { // этот асинк нужен, что бы подождать нормально
	let totalErrors = []; // массив кратких ошибок. Нужен, что бы в дальнейшем выпукнуть краткий лог в лс разработчику
	
	// ФУНКЦИИ
	const nekFuncs = await loadFunctions(); // читаем функции
	if (!nekFuncs.errors[0]) { // если нет ни единой ошибки, то всё ок
		nek.simplelog('OK!', 'green');
	} else { // если есть хоть одна ошибка, то проверить все
		nek.simplelog('ERR!', 'red'); // пишем статус ошибки
		nek.log('ERROR', 'Caught error(s) while loading functions!', 'red') // пишем, что произошли ошибки
		for await (const err of nekFuncs.errors) { // начинаем перечислять все ошибки в косноль
			nek.simplelog('> ' + err.file + ' <  Error log below:', 'red')
			console.error(err.error); // пишем полную ошибку в консоль
			totalErrors.push(err.error.name); // добавляем краткую ошибку в массив
		}
	}
	
	// КОМАНДЫ
	const nekComms = await loadCommands(); // читаем команды
	if (!nekComms.errors[0]) { // если нет ни единой ошибки, то всё ок
		nek.simplelog('OK!', 'green');
	} else { // если есть хоть одна ошибка, то проверить все
		nek.simplelog('ERR!', 'red'); // пишем статус ошибки
		nek.log('ERROR', 'Caught error(s) while loading commands!', 'red') // пишем, что произошли ошибки
		for await (const err of nekComms.errors) { // начинаем перечислять все ошибки в косноль
			nek.simplelog('> ' + err.file + ' <  Error log below:', 'red')
			console.error(err.error); // пишем полную ошибку в консоль
			totalErrors.push(err.error.name); // добавляем краткую ошибку в массив
		}
	}
	
	// DISCORD
	try {
		const social = require("./src/" + config.socfile + '.js'); // читаем файл (socfile - social file)
		
		if (totalErrors[0]) { // если есть ошибки, то 
			if (config.noDmErrors) { // если нельзя логировать ошибки
				nek.log('BOOTLOADER', 'Can\'t log errors in dm. Shutting down...')
				process.exit(1);
			} else {
				nek.log('BOOTLOADER', 'Trying to log errors in dm...')
				social.logErrors(config, totalErrors)
				return;
			}
		}
		social.start(nek, config, nekFuncs, nekComms);
	} catch(e) {
		nek.log('ERROR', 'Failed to load socfile!', 'red');
		console.error(e);
		process.exit(1);
	}
})();