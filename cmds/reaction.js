const {
    timeStamp
} = require("console");

module.exports = {
    name: 'react',
    description: 'tweet things',
    execute(message, args) {
        message.react('🇹')
        message.react('🇼')
        message.react('™️')


    },

};