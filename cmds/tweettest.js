const {
    timeStamp
} = require("console");

module.exports = {
    name: 'help',
    description: 'tweet things',
    execute(message, args) {
        message.channel.send(`\`=== commands ===\`\r\n${twtBot.config.prefix}post [content]\r\n`)

    },

};