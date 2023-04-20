const Discord = require("discord.js");
const perm2bit = { // блять как же я ненавижу за это discord.js v14
	ADD_REACTIONS: Discord.PermissionsBitField.Flags.AddReactions,
	ADMINISTRATOR: Discord.PermissionsBitField.Flags.Administrator,
	ATTACH_FILES: Discord.PermissionsBitField.Flags.AttachFiles,
	BAN_MEMBERS: Discord.PermissionsBitField.Flags.BanMembers,
	CHANGE_NICKNAME: Discord.PermissionsBitField.Flags.ChangeNickname,
	CONNECT: Discord.PermissionsBitField.Flags.Connect,
	CREATE_INSTANT_INVITE: Discord.PermissionsBitField.Flags.CreateInstantInvite,
	CREATE_PRIVATE_THREADS: Discord.PermissionsBitField.Flags.CreatePrivateThreads,
	CREATE_PUBLIC_THREADS: Discord.PermissionsBitField.Flags.CreatePublicThreads,
	DEAFEN_MEMBERS: Discord.PermissionsBitField.Flags.DeafenMembers,
	EMBED_LINKS: Discord.PermissionsBitField.Flags.EmbedLinks,
	KICK_MEMBERS: Discord.PermissionsBitField.Flags.KickMembers,
	MANAGE_CHANNELS: Discord.PermissionsBitField.Flags.ManageChannels,
	MANAGE_EVENTS: Discord.PermissionsBitField.Flags.ManageEvents,
	MANAGE_GUILD: Discord.PermissionsBitField.Flags.ManageGuild,
	//MANAGE_GUILD_EXPRESSIONS: Discord.PermissionsBitField.Flags.ManageGuildExpressions,
	MANAGE_MESSAGES: Discord.PermissionsBitField.Flags.ManageMessages,
	MANAGE_NICKNAMES: Discord.PermissionsBitField.Flags.ManageNicknames,
	MANAGE_ROLES: Discord.PermissionsBitField.Flags.ManageRoles,
	MANAGE_THREADS: Discord.PermissionsBitField.Flags.ManageThreads,
	MANAGE_WEBHOOKS: Discord.PermissionsBitField.Flags.ManageWebhooks,
	MENTION_EVERYONE: Discord.PermissionsBitField.Flags.MentionEveryone,
	MODERATE_MEMBERS: Discord.PermissionsBitField.Flags.ModerateMembers,
	MOVE_MEMBERS: Discord.PermissionsBitField.Flags.MoveMembers,
	MUTE_MEMBERS: Discord.PermissionsBitField.Flags.MuteMembers,
	PRIORITY_SPEAKER: Discord.PermissionsBitField.Flags.PrioritySpeaker,
	READ_MESSAGE_HISTORY: Discord.PermissionsBitField.Flags.ReadMessageHistory,
	REQUEST_TO_SPEAK: Discord.PermissionsBitField.Flags.RequestToSpeak,
	SEND_MESSAGES: Discord.PermissionsBitField.Flags.SendMessages,
	SEND_MESSAGES_IN_THREADS: Discord.PermissionsBitField.Flags.SendMessagesInThreads,
	SEND_TTS_MESSAGES: Discord.PermissionsBitField.Flags.SendTTSMessages,
	SPEAK: Discord.PermissionsBitField.Flags.Speak,
	STREAM: Discord.PermissionsBitField.Flags.Stream,
	USE_APPLICATION_COMMANDS: Discord.PermissionsBitField.Flags.UseApplicationCommands,
	USE_EMBEDDED_ACTIVITIES: Discord.PermissionsBitField.Flags.UseEmbeddedActivities,
	USE_EXTERNAL_EMOJIS: Discord.PermissionsBitField.Flags.UseExternalEmojis,
	USE_EXTERNAL_STICKERS: Discord.PermissionsBitField.Flags.UseExternalStickers,
	//USE_SOUNDBOARD: Discord.PermissionsBitField.Flags.UseSoundboard,
	USE_VAD: Discord.PermissionsBitField.Flags.UseVAD,
	VIEW_AUDIT_LOG: Discord.PermissionsBitField.Flags.ViewAuditLog,
	VIEW_CHANNEL: Discord.PermissionsBitField.Flags.ViewChannel,
	//VIEW_CREATOR_MONETIZATION_ANALYTICS: Discord.PermissionsBitField.Flags.ViewCreatorMonetizationAnalytics,
	VIEW_GUILD_INSIGHTS: Discord.PermissionsBitField.Flags.ViewGuildInsights
}
bit2perm = {};
for (var [key, value] of Object.entries(perm2bit)) { // перебираем каждое значение этого дерьма выше
    bit2perm[value] = key; // меняем местами значение (value) и имя этого значения (key)
}

class Perms {
    constructor(nek){
        this.name = "perms";
		this.version = "1.0"
    }
	
	// Проверка прав в канале
	//
	// ВХОД:
	//  nek - nek
	//  msg - msg или interaction
	//  perms - массив пермишенов ( например: ["READ_MESSAGE_HISTORY", "EMBED_LINKS", "ATTACH_FILES"] )
	//  > https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags 
	// ВЫХОД:
	//  Массив тех прав, которые отсутствуют в канале ( например: ["ATTACH_FILES", "EMBED_LINKS"] )
	//
    checkPerms(nek, msg, perms){
		if (!msg.guild) { // если нету сервера, то нечего и проверять
			return [false]; // возвращаем пустоту, ведь нет никаких отсутствующих прав
		}

		let permsBit = []; // задаём массив переведённых прав
		for (let perm of perms) { // переводим каждое право для discord.js
			permsBit.push(perm2bit[perm]);
		}
		const botPerms = msg.guild.members.me.permissionsIn(msg.channel); // получаем все права бота в данном канале
		if (!botPerms.has(permsBit)) { // проверяем права. И если какого-то права нету, то разузнать какого
			let lostPerms = [];
			permsBit.forEach(perm => { // перебираем каждое право по одному
				if (!botPerms.has(perm)) {
					lostPerms.push(bit2perm[perm]);
				}
			})
			return lostPerms;
		}
		
		return [false]; // возвращаем пустоту, ведь нет никаких отсутствующих прав
	}
}

module.exports = Perms;

