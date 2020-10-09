const {
    timeStamp
} = require("console");

module.exports = {
    name: 'help',
    description: 'tweet things',
    execute(message, args) {
        message.author.send('**Commands:**\n-help\n-post') // edit this code to tweet later

    },

};