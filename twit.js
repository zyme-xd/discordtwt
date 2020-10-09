const Discord = require('discord.js')
const client = new Discord.Client();
require('dotenv').config();
const Twit = require("twit")
const fs = require('fs')
const http = require('http')
const config = require("./config");
const path = require("path");
global.config = config;
client.commands = new Discord.Collection

global.bannedUsers = []



const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_SECRET,
})

if (fs.existsSync(__dirname + "/bannedusers.txt")) {
    global.bannedUsers = fs.readFileSync(__dirname + "/bannedusers.txt").toString().split("\n");
} else {
    global.bannedUsers = [];
    fs.writeFileSync(__dirname + "/bannedusers.txt", "");
}


console.log(T, `twitter info has been loaded`)

console.log(config.prefix, 'prefix loaded')

const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./cmds/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}
console.log(commandFiles)

const token = process.env.DISCORD_TOKEN;
// getting token from env file, this is so this project can be open-source in the future and my api keys and tokens aren't
// going to be shown in the github respiratory, thank you gitignore!


client.on('ready', () => {
    console.log('logged in as ' + client.user.tag + ', bot ready'); // now it sends the bots tag,
    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'tweets in ' + client.guilds.cache.size + ' servers!',
            type: 'WATCHING',
            url: 'https://twitter.com/TwtDiscord'
        }
    })
});


client.on('message', message => {
    if (bannedUsers.includes(message.author.id))
        return;
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();



    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(token)