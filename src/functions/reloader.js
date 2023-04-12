const fs = require("fs");

class ReLoader {
    constructor(nek){
        this.name = "reloader"; // имя команды
    }

    load(nek, name, mode){
		let filePath = ""
		if (mode === 'functions') {
			if (nek.functions.has(name)) {
				return "already_loaded";
			}
			filePath = '../functions/' + name;
			const kaka = require(filePath);
			const proto = new kaka(nek);
			nek.functions.set(proto.name, proto);
			console.log(nek.functions)
			return "OK!";

		} else if (mode === 'commands') {
			if (nek.commands.has(name)) {
				return "already_loaded";
			}
			filePath = '../commands/' + name;
			const kaka = require(filePath);
			const proto = new kaka(nek);
			nek.commands.set(proto.name, proto);
			
			return "OK!";
		} else {
			return "unknown_mode";
		}
	}
	
	unload(nek, name, mode){
		let filePath = ""
		if (mode === 'functions') {
			if (!nek.functions.has(name)) {
				return "not_loaded";
			}
			filePath = '../functions/' + name;
			nek.functions.delete(name);
		} else if (mode === 'commands') {
			if (!nek.commands.has(name)) {
				return "not_loaded";
			}
			filePath = '../commands/' + name;
			nek.commands.delete(name);
			
		} else {
			return "unknown_mode";
		}
		
		nek.commands.delete(name);
		delete require.cache[require.resolve(filePath)];

		return "Unloaded";
	}
	
	reload(nek, name, mode){
		const sos = this.unload(nek, name, mode);
		console.log(sos)
		const sas = this.load(nek, name, mode);
		console.log(sas)
		console.log(nek.commands)
		return 'done';
	}
	
}

module.exports = ReLoader;

