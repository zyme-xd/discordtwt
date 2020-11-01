global.twtBot = {
    config: require("./config.js"),
    bannedUsers: require("./bannedUsers.json"),
    nodeModules: {
        Twit: require("twit"),
        fs: require("fs"),
        http: require("http"),
        path: require("path"),
        Discord: require("discord.js")
    },
    client: null
}
twtBot.client = new twtBot.nodeModules.Discord.Client()
twtBot.twitter = new twtBot.nodeModules.Twit(twtBot.config.token.twitter)
twtBot.client.commands = new twtBot.nodeModules.Discord.Collection;


console.debug(`[core] => prefix loaded as "${twtBot.config.prefix}"`)
console.debug(`[twitter] => config;`, twtBot.twitter)

const commandFiles = twtBot.nodeModules.fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./cmds/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    twtBot.client.commands.set(command.name, command);
}
console.log(`[core] => commandFiles `,commandFiles);


twtBot.client.on('ready', () => {
    // Preperation for Logging
    if (twtBot.config.fileLogging) {
        twtBot.logLocation = `logs/${twtBot.client.readyTimestamp}.csv`;
        if (!twtBot.nodeModules.fs.existsSync("logs")){ 
            twtBot.nodeModules.fs.mkdirSync("logs"); 
        }
        if (!twtBot.nodeModules.fs.exists(twtBot.logLocation,function(){return;})) {
            var logFormat = `Message Timestamp,GuildID,MessageID,ChannelID,AuthorID, Author Username#Discriminator,Message Content\r\n`
            twtBot.nodeModules.fs.writeFile(twtBot.logLocation, logFormat, function (err) {
                if (err) throw err;
                console.log(`[logging] => created file '${twtBot.logLocation}'`);
                return;
              });
        }
    }

    // Console Logging (duh)
    console.debug(`[discord] => Ready`)
    console.debug(`[discord] identity => "${twtBot.client.user.username}#${twtBot.client.user.discriminator}"`)

    // Set the status for people to know wtf to do.
    twtBot.client.user.setPresence({
        status: 'online',
        activity: {
            name: `tweets in ${twtBot.client.guilds.cache.size} servers! use "${twtBot.config.prefix}help" to get started`,
            type: 'WATCHING',
            url: 'https://twitter.com/TwtDiscord'
        }
    })
});

// Command Logging
twtBot.client.on('message',(msg)=>{
    if (!twtBot.config.fileLogging) return;
    if (!twtBot.client.commands.has(msg.content.slice(twtBot.config.prefix.length).trim().split(' ').shift().toLowerCase())) return;

    var dataToWrite = 
// here is da format
// Message Timestamp  |  Author GuildID  |     Message ID     |  Author Channel ID  |    Author ID   |          Author Username+Discriminator           |    Message Content   |  
`${msg.createdTimestamp},${msg.guild.id   },${msg.id            },${msg.channel.id    },${msg.author.id},${msg.author.username}#${msg.author.discriminator},${msg.content.replace(",","")}`;

    try {
        twtBot.nodeModules.fs.appendFileSync(twtBot.logLocation,`${dataToWrite}\r\n`); 
        console.debug(`[logging] appended => ${msg.id}`)
    } catch (e) {
        console.error(e)
    }
    return;
})


twtBot.client.on('message', (message) => {
    try {
        if (twtBot.bannedUsers.includes(message.author.id)) return;
        var args = message.content.slice(twtBot.config.prefix.length).trim().split(' ');
        var command = args.shift().toLowerCase();
        if (message.author.bot) return;
        if (!twtBot.client.commands.has(command)) return;
        twtBot.client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("darn, an error has occurred.")
    }
});

twtBot.client.login(twtBot.config.token.discord)