// New Kitsune (NeKit) bootstrap // Anton Borisovich
//  Обновлено: смотрите свойства файла index.js

// Пояснения по комментариям:
//  Читаем, считываем - начать чтение переменной, файла
//  Пишем, запоминаем - начать запись переменной, файла
//  Выводим, информируем, пишем - начать логирование в консоль или чат
//  Выходим, вылетаем - закрыть процесс node

// Порядок инициализации загрузчика:
//  - Чтение информации о загрузчике (bootmeta.json) [больше не существует]
//  - Чтение пользовательских настроек (config.json)
//  - Проверка аргументов запуска и правильности составления файла настроек
//  - Чтение функций (src/functions/*.js)
//  - Чтение команд (src/commands/*.js)
//  - Исполнение функции social (из файла соц. сети, например discord.js)
//  -- Дальшнейшую работу делает соц. сеть, загрузчик закончил свою работу

// Да, все комментарии на русском ибо в английском я плох и могу написать того, что не смогу понять в будущем.

let nek = { // главная переменная всего бота
	config: {
		codename: "nekit",
		fullname: "New Kitsune",
		version: "1.1.1"
	}
}; 

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
			break;
		case 'red':
			color = "\x1b[31m"; // FgRed
			break;
		case 'green':
			color = "\x1b[32m"; // FgGreen
			break;
		case 'yellow':
			color = "\x1b[33m"; // FgYellow
			break;
		case 'blue':
			color = "\x1b[34m"; // FgBlue
			break;
		case 'magenta':
			color = "\x1b[35m"; // FgMagenta
			break;
		case 'cyan':
			color = "\x1b[36m"; // FgCyan
			break;
		case 'gray':
			color = "\x1b[90m"; // FgGray
			break;
		default:
			color = "\x1b[0m"; // reset the color
			break;
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
			break;
		case 'red':
			color = "\x1b[31m"; // FgRed
			break
		case 'green':
			color = "\x1b[32m"; // FgGreen
			break;
		case 'yellow':
			color = "\x1b[33m"; // FgYellow
			break;
		case 'blue':
			color = "\x1b[34m"; // FgBlue
			break;
		case 'magenta':
			color = "\x1b[35m"; // FgMagenta
			break;
		case 'cyan':
			color = "\x1b[36m"; // FgCyan
			break;
		case 'gray':
			color = "\x1b[90m"; // FgGray
			break;
		default:
			color = "\x1b[0m"; // reset the color
			break;
	}
	if (!noBrake) { // если мы не хотим печатать на той же строке
		console.log(color + msg + '\x1b[0m');
	} else { // если мы	хотим печатать на той же строке
		process.stdout.write(color + msg + '\x1b[0m');
	}
}

// === НАЧАЛО РАБОТЫ === //
nek.log('BOOTSTRAP', '"' + nek.config.fullname + '" started! Version: ' + nek.config.version); // информируем, что загрузчик успешно задал основные функции

nek.launchTime = Date.now(); // запоминаем время запуска
nek.errorsCount = 0;
const os = require('os'); // подключение библиотеки получение данных о системе (os)
const fs = require("fs"); // подключение библиотеки файловой системы (fs)

// Загрузка пользовательских настроек (конфига)
nek.log('BOOTSTRAP', 'Reading config...', false, true); // информируем, что начинаем читать конфиг
try {
	nek.config = {...nek.config, ...require('./src/config/config.json')}; // читаем файл конфига
	nek.simplelog('OK!', 'green'); // информируем, что конфиг успешно считаны
} catch(e) {
	nek.simplelog('ERR!', 'red'); // всё хреново
	console.error(e); // выводим ошибку
	process.exit(1); // выходим
}

// === ОБРАБОТКА АРГУМЕНТОВ === //
for (let param of process.argv.slice(2)) { // смотрим на параметры
	if (param.startsWith('--')) {
		param = param.replace('--', ''); // убрать --
		param = param.split('='); // разбить на массив через знак =
		if (!param[1]) { // если параметр не равняется ничему (предположительно boolean)
			if (nek[param[0]]) { // если параметр есть в переменной nek
				nek[param[0]] = true; // записать новое значение
				nek.log("ARGUMENTS", "Setting nek config '" + param[0] + "' to 'true'", "magenta"); // уведомить
			} else { // иначе записать как пользовательский пара
				nek.config[param[0]] = true; // записать новое значение
				nek.log("ARGUMENTS", "Setting user config '" + param[0] + "' to 'true'", "magenta"); // уведомить
			}
		} else {
			if (nek[param[0]]) { // если параметр есть в переменной nek
				nek[param[0]] = param.slice(1).join(""); // записать новое значение
				nek.log("ARGUMENTS", "Setting nek config '" + param[0] + "' to '" + nek[param[0]] + "'", "magenta"); // уведомить
			} else { // иначе записать как пользовательский пара
				nek.config[param[0]] = param.slice(1).join(""); // записать новое значение
				nek.log("ARGUMENTS", "Setting user config '" + param[0] + "' to '" + nek.config[param[0]] + "'", "magenta"); // уведомить
			}
		}
	} else {
		nek.log("ARGUMENTS", "Unknown argument '" + param + "'", 'yellow');
	}
}

// === ПРОВЕРКА КОНФИГА	===
if (!nek.config.prefix) { 
	nek.log("ERROR", "No prefix provided!", "red"); // информируем об ошибке
	process.exit(1); // выходим
}
if (!nek.config.socfile) {
	nek.log("ERROR", "No socfile provided!", "red"); // информируем о смене socfile-а
	process.exit(1); // выходим
}
if (!nek.config.basecolor) {
	nek.log("ERROR", "No basecolor provided! Falling to \"#FFFFFF\"", "yellow"); // информируем о смене цвета
	nek.config.basecolor = "#FFFFFF"; // меняем цвет
}
if (!nek.config.errorcolor) {
	nek.log("ERROR", "No errorcolor provided! Falling to \"#FF0000\"", "yellow"); // информируем о смене цвета
	nek.config.basecolor = "#FF0000"; // меняем цвет
}
if (!nek.config.name) { // если есть имя
	nek.log("WARNING", "No custom name provided! Falling to \"NeKit\"", "yellow"); // информируем о смене имени
	nek.config.name = "NeKit"; // меняем имя
}

// Загрузка конфиденциальных параметров
nek.log('BOOTSTRAP', 'Reading secrets...', false, true); // информируем, что начинаем читать секреты и токены
try {
	const secrets = require('./src/config/secrets.json'); // читаем файл конфига
	nek.config["token_" + nek.config.socfile] = secrets["token_" + nek.config.socfile] // пишем токен из секретов в токен
	nek.config.Secret2FA = secrets.Secret2FA // пишем секрет из секретов в токен
	nek.simplelog('OK!', 'green'); // информируем, что конфиг успешно считаны
} catch(e) {
	nek.simplelog('ERR!', 'red'); // всё хреново
	console.error(e); // выводим ошибку
	process.exit(1); // выходим
}

// === ЧТЕНИЕ ФУНКЦИЙ И КОМАНД: ЗАДАЁМ ФУНКЦИИ === //

// Чтение функций
function loadFunctions() {
	nek.log('BOOTSTRAP', 'Loading functions...', false, true);
	nek.functions = new Map(); // создаём мапу функций
	let funcErrs = []; // создаём массив ошибок
	const dir = fs.readdirSync('./src/functions/'); // смотрим папку с функциями
	for ( const file of dir ) { // перебираем все файлы
		try {
			if (file.endsWith(".js")) { // если .js то работать
				const fileName = file.substring(0,file.length-3);
				const fncPrototype = require("./src/functions/"+fileName); // читаем файл
				const func = new fncPrototype(nek); // вытаскиваем из файла функцию
				nek.functions.set(func.name, func); // пишем фунцкию в мапу
			}
		} catch(e) {
			funcErrs.push({file: file, error: e});
		}
	}
	
	return funcErrs;
}
// Чтение команд
function loadCommands() {
	nek.log('BOOTSTRAP', 'Loading commands...', false, true);
	nek.commands = new Map(); // создаём мапу команд
	let commErrs = []; // создаём массив ошибок
	const dir = fs.readdirSync('./src/commands/'); // смотрим папку с командами
	for ( const file of dir ) { 
		try {
			if (file.endsWith(".js")) { // если .js то работать
				const fileName = file.substring(0,file.length-3);
				const cmdPrototype = require("./src/commands/"+fileName); // читаем файл
				const command = new cmdPrototype(nek); // вытаскиваем из файла функцию
				nek.commands.set(command.name, command); // пишем команду в мапу
			}
		} catch(e) {
			commErrs.push({file: file, error: e});
		}
	}
	return commErrs;
}


// === ЧТЕНИЕ ФУНКЦИЙ И КОМАНД: РАБОТАЕМ === //
let totalErrors = []; // массив кратких ошибок. Нужен, что бы в дальнейшем выпукнуть краткий лог в лс разработчику

// Функции
let nekFuncs = loadFunctions(); // читаем функции
if (!nekFuncs[0]) { // если нет ни единой ошибки, то всё ок
	nek.simplelog('OK!', 'green');
} else { // если есть хоть одна ошибка, то проверить все
	nek.simplelog('ERR!', 'red'); // пишем статус ошибки
	nek.log('ERROR', 'Caught error(s) while loading function(s)!', 'red'); // пишем, что произошли ошибки
	for (const err of nekFuncs) { // начинаем перечислять все ошибки в косноль
		nek.simplelog('> ' + err.file + ' <  Error log below:', 'red');
		console.error(err.error); // пишем полную ошибку в консоль
		totalErrors.push(err.error.name + ": " + err.error.message + "\n>" + err.error.stack.slice(0, err.error.stack.indexOf('\n'))); // добавляем краткую ошибку в массив
		// краткая ошибка выглядит так:
		// name: message
		// >файл_где_произошла_ошибка:строка
	}
}
// Команды
let nekComms = loadCommands(); // читаем команды
if (!nekComms[0]) { // если нет ни единой ошибки, то всё ок
	nek.simplelog('OK!', 'green');
} else { // если есть хоть одна ошибка, то проверить все
	nek.simplelog('ERR!', 'red'); // пишем статус ошибки
	nek.log('ERROR', 'Caught error(s) while loading command(s)!', 'red'); // пишем, что произошли ошибки
	for (const err of nekComms) { // начинаем перечислять все ошибки в косноль
		nek.simplelog('> ' + err.file + ' <  Error log below:', 'red');
		console.error(err.error); // пишем полную ошибку в консоль
		totalErrors.push(err.error.name + ": " + err.error.message + "\n>" + err.error.stack.slice(0, err.error.stack.indexOf('\n'))); // добавляем краткую ошибку в массив
		// краткая ошибка выглядит так:
		// name: message
		// >файл_где_произошла_ошибка:строка
	}
}

// Вход в сеть
try {
	const sock = require("./src/" + nek.config.socfile + '.js'); // читаем файл (socfile - social file)
	const social = new sock(nek); // прототипим файл ???
	nek.log('BOOTSTRAP', 'Loaded ' + social.name + ' [' + social.version + ']');
	if (totalErrors[0]) { // если есть ошибки, то 
		if (nek.config.noDmErrors) { // если нельзя логировать ошибки
			nek.log('BOOTSTRAP', 'Skipped error report. Shutting down...');
			process.exit(1);
		} else {
			nek.log('BOOTSTRAP', 'Trying to report errors...');
			social.logErrors(nek, totalErrors);
			return;
		}
	}
	social.start(nek);
} catch(e) {
	nek.log('ERROR', 'Failed to load socfile!', 'red');
	console.error(e);
	process.exit(1);
}