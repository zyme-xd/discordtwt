const {
    S_IRGRP
} = require('constants');
const Discord = require('discord.js')
const client = new Discord.Client();
const fs = require("fs");
const embed = new Discord.MessageEmbed()
    .setTitle('Blacklisted')
    .setColor(0xCC4040)
    .setDescription("You've been blacklisted from the TWTDiscord bot.")
    .setFooter("Please note, you may not appeal.")
module.exports = {
    name: 'ban',
    description: 'ban people', // i spent 2 hours writing this what the fuck
    execute(message, args) {
        if (config.admins.includes(message.author.id)) {
            let userId = message.mentions.users.first() ? message.mentions.users.first().id : args[0]
            bannedUsers.push(userId)
            fs.writeFile(__dirname + "/../bannedusers.txt", bannedUsers.join('\n'), function (err) {
                // Checks if there is an error
                if (err) return console.log(err);
                message.react("✅")
                message.client.users.fetch(userId).then(user => user.send(embed)).catch(err => console.log(err));
            });
        } else {
            return
        }

    }

}