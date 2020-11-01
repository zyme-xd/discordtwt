const { timeStamp } = require("console");

module.exports = {
    name: 'help',
    description: 'i think you know what i mean',
    userCommand: true,
    execute(message) {
		var args = message.content.slice(twtBot.config.prefix.length).trim().split(' ');
		var msgToSend = new twtBot.nodeModules.Discord.MessageEmbed()
			.setTitle(`${twtBot.client.user.username} Help`)
			.setFooter(`Requested by ${message.author.username}#${message.author.discriminator}`)
			.setTimestamp();
		twtBot.client.commands.forEach((cI)=>{
			if (!cI.userCommand) return;
			msgToSend.addField(`${twtBot.config.prefix}${cI.name}`,cI.description,true)
		})
		message.channel.send(msgToSend)
		return;
		var msgContent = new twtBot.nodeModules.Discord.MessageEmbed()
			.setTitle("Help")
			.setFooter(`Requested by ${message.author.username}#${message.author.discriminator}`)
			.setDescription("Commands have moved to https://zyrn.wtf/twtdiscord.html#commands")
			.setTimestamp()
		message.channel.send(msgContent)

    },

};