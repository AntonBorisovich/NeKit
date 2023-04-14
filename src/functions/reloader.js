const fs = require("fs");

class ReLoader {
    constructor(nek){
        this.name = "reloader";
		this.version = "1.0"
    }

    load(nek, name, mode){ // загрузить новую команду/функцию
		try {
			let filePath = ""
			if (mode === 'functions') { // функции
				if (nek.functions.has(name)) { // если функция уже загружена
					return "Already loaded"; // вернуть шашипку
				}
				filePath = '../functions/' + name; // задаем файл, который надо найти
				const kaka = require(filePath); // грузим файл
				const proto = new kaka(nek); // прототипим
				nek.functions.set(proto.name, proto); // пишем функцию в мапу
				return "OK!"; // ура всё получилось!

			} else if (mode === 'commands') { // команды
				if (nek.commands.has(name)) { // если команда уже загружена
					return "Already loaded"; // вернуть шашипку
				}
				filePath = '../commands/' + name; // задаем файл, который надо найти
				const kaka = require(filePath); // грузим файл
				const proto = new kaka(nek); // прототипим
				nek.commands.set(proto.name, proto); // пишем функцию в мапу
				return "OK!"; // ура всё получилось!
			} else { // а как
				return "wtf"; 
			}
		} catch(e) {
			console.log(e)
			return e.name + ": " + e.message;
		}
	}
	
	unload(nek, name, mode){ // выгрузка команды/функции
		try {
			let filePath = ""
			if (mode === 'functions') { // функции
				if (!nek.functions.has(name)) { // если функции нету
					return "Not found"; // то и нечего выгружать
				}
				filePath = '../functions/' + name; // задаем файл, который надо найти
				nek.functions.delete(name); // удаляем функцию из мапы
				delete require.cache[require.resolve(filePath)]; // удаляем функцию из кэша нода
				return "OK!"; // ура всё получилось!
			} else if (mode === 'commands') {
				if (!nek.commands.has(name)) { // если команды нету
					return "Not found"; // то и нечего выгружать
				}
				filePath = '../commands/' + name; // задаем файл, который надо найти
				nek.commands.delete(name); // удаляем команду из мапы
				delete require.cache[require.resolve(filePath)]; // удаляем команду из кэша нода
				return "OK!"; // ура всё получилось!
			} else { // а как
				return "wtf";
			}
		} catch(e) {
			console.log(e)
			return e.name + ": " + e.message;
		}
	}
	
	reload(nek, name, mode){
		let returnString = ""
		const unloadResult = this.unload(nek, name, mode);
		if (unloadResult !== 'OK!') return unloadResult;
		const loadResult = this.load(nek, name, mode);
		if (loadResult !== 'OK!') return loadResult;
		return 'OK!';
	}
	
}

module.exports = ReLoader;

