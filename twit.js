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


console.log(twtBot.twitter, `twitter info has been loaded`)

console.log(twtBot.config.prefix, 'prefix loaded')

//twtBot.twitter.stream('user').on('connected', (res)=>{
//    console.debug(`[twitter] => Connected`)
//})

const commandFiles = twtBot.nodeModules.fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./cmds/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    twtBot.client.commands.set(command.name, command);
}
console.log(`[core] => commandFiles `,commandFiles)


twtBot.client.on('ready', () => {
    console.debug(`[discord] => Ready`)
    console.debug(`Logged in as "${twtBot.client.user.username}#${twtBot.client.user.discriminator}"`)
    twtBot.client.user.setPresence({
        status: 'online',
        activity: {
            name: `tweets in ${twtBot.client.guilds.cache.size} servers! use "${twtBot.config.prefix}help" to get started`,
            type: 'WATCHING',
            url: 'https://twitter.com/TwtDiscord'
        }
    })
});


twtBot.client.on('message', (message) => {
    var args = message.content.slice(twtBot.config.prefix.length).trim().split(' ');
    var command = args.shift().toLowerCase();
    if (!twtBot.client.commands.has(command)) return;

    try {
        if (twtBot.bannedUsers.includes(message.author.id)) return;
        if (!message.content.startsWith(twtBot.config.prefix)) return;
        if (message.author.bot) return;
        twtBot.client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("darn, an error has occurred.")
    }
});

twtBot.client.login(twtBot.config.token.discord)