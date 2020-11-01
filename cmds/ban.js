const fs = require("fs");
const embed = new twtBot.nodeModules.Discord.MessageEmbed()
    .setTitle('Blacklisted')
    .setColor(0xCC4040)
    .setDescription("You've been blacklisted from the TWTDiscord bot.")
    .setFooter("Please note, you may not appeal.")
module.exports = {
    name: 'ban',
    description: 'ban people', // i spent 2 hours writing this what the fuck
    execute(message, args) {
        if (config.admins.includes(message.author.id)) {
            let userId = message.mentions.users.first().id || args[0]
            bannedUsers.push(userId)
            fs.writeFile(__dirname + "/../bannedUsers.json", JSON.stringify(bannedUsers,null,'\t'), function (err) {
                // Checks if there is an error
                if (err) return console.log(err);
                message.react("✅")
                message.client.users.fetch(userId).then(user => user.send(embed)).catch(console.error);
            });
        } else {
            return;
        }

    }

}