module.exports = {
    "prefix": "-",
    "sendCooldown": 10000,
    "errCooldown":5000,
    "logChannel":"channelid",
    "admins": ["admin1","admin2"],
    "token": {
        "twitter": {
            "consumer_key": process.env.CONSUMER_KEY,
            "consumer_secret": process.env.CONSUMER_SECRET,
            "access_token": process.env.ACCESS_TOKEN,
            "access_token_secret": process.env.ACCESS_SECRET
        },
        "discord": process.env.DISCORD_TOKEN
    }
}