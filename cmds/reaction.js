const {
    timeStamp
} = require("console");

module.exports = {
    name: 'react',
    description: 'it reacts to stuff',
    userCommand: false,
    execute(message, args) {
        message.react('🇹')
        message.react('🇼')
        message.react('™️')


    },

};