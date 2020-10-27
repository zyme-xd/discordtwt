const tweettest = require("./tweettest");
const Twit = require("twit");
const fs = require("fs");
const { stringify } = require("querystring");
const URLRegex = require('./badword/TLDBlock');
const spellchecker = require("spellchecker");
const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_SECRET,
});
const Discord = require("discord.js");

// Replacements, thank you nullobsi holy shit this looks like a nightmare
const ranges = [
    [32, 47, "symbol"],
    [58, 64, "symbol"],
    [48, 57, "alphanumeric"],
    [65, 90, "alphanumeric"],
    [91, 96, "symbol"],
    [97, 122, "alphanumeric"],
    [123, 126, "symbol"],
    [0x2700, 0x27bf, "emoji"],
    [0x1f300, 0x1f5ff, "emoji"],
    [0x1f900, 0x1f9ff, "emoji"],
    [0x1f600, 0x1f64f, "emoji"],
    [0x1f680, 0x1f6ff, "emoji"],
    [0x2600, 0x26FF, "emoji"],
    [0x1FA70, 0x1FAFF, "emoji"],
    [0x1F1E6, 0x1F1FF, "emoji"]
];
const replacements = [{
        replace: [0x1F1E6, 0x1F1FF],
        with: [0x0061, 0x007A]
    },
    {
        with: "a",
        replace: ["@", "4", "^", "/\\", "/-\\"]
    },
    {
        with: "b",
        replace: ["8", "6", "13", "|3", "/3", "ß", "P>", "|:"]
    },
    {
        with: "c",
        replace: ["©", "¢", "<", "[", "(", "{"]
    },
    {
        with: "d",
        replace: [")", "|)", "[)", "?", "|>", "|o"]
    },
    {
        with: "e",
        replace: ["3", "&", "€", "ë", "[-"]
    },
    {
        with: "f",
        replace: ["ƒ", "|=", "/=", "|#"]
    },
    {
        with: "g",
        replace: ["6", "9", "&", "C-", "(_+"]
    },
    {
        with: "h",
        replace: ["#", "}{", "|-|", "]-[", "[-]", ")-(", "(-)", "/-/"]
    },
    {
        with: "i",
        replace: ["1", "!", "¡", "|", "]"]
    },
    {
        with: "j",
        replace: ["]", "¿", "_|", "_/", "</", "(/"]
    },
    {
        with: "k",
        replace: ["|<", "|{", "|("]
    },
    {
        with: "l",
        replace: ["|", "1", "£", "|_", "1_", "¬"]
    },
    {
        with: "m",
        replace: ["|v|", "|\\/|", "/\\/\\", "(v)", "/|\\", "//.", "^^"]
    },
    {
        with: "n",
        replace: ["|\\|", "/\\/", "[\\]", "<\\>", "/V", "^/"]
    },
    {
        with: "o",
        replace: ["0", "()", "[]", "°"]
    },
    {
        with: "p",
        replace: ["¶", "|*", "|o", "|°", "|\"", "|>", "9", "|7", "|^(o)"]
    },
    {
        with: "q",
        replace: ["9", "0_", "()_", "(_,)", "<|"]
    },
    {
        with: "r",
        replace: ["2", "®", "/2", "12", "I2", "l2", "|^", "|?"]
    },
    {
        with: "s",
        replace: ["5", "$", "§"]
    },
    {
        with: "t",
        replace: ["7", "+", "†", "-|-", "\'][\'"]
    },
    {
        with: "u",
        replace: ["µ", "|_|", "(_)", "L|"]
    },
    {
        with: "v",
        replace: ["\\/", "^"]
    },
    {
        with: "w",
        replace: ["\\/\\/", "\\\\\'", "\'//", "\\|/", "\\^/", "(n)"]
    },
    {
        with: "x",
        replace: ["%", "*", "><", "}{", ")("]
    },
    {
        with: "y",
        replace: ["¥", "\'/"]
    },
    {
        with: "z",
        replace: ["2", "7_", "~/_", ">_", "%"]
    },
];
let symbols = [];
let emojis = [];
let replace_values = [];
let replace_with = [];

for (let i = 0; i < replacements.length; i++) {
    let entry = replacements[i];
    if (typeof entry.with == "string") {
        switch (typeof entry.replace) {
            case "string":
                replace_values.push(entry.replace);
                replace_with.push(entry.with);
                break;
            case "object":
                for (let z = 0; z < entry.replace.length; z++) {
                    replace_values.push(entry.replace[z]);
                    replace_with.push(entry.with);
                }
                break;
        }
        continue;
    }
    for (let z = entry.replace[0]; z <= entry.replace[1]; z++) replace_values.push(String.fromCodePoint(z));
    for (let z = entry.with[0]; z <= entry.with[1]; z++) replace_with.push(String.fromCodePoint(z));
}


let temp_allowed = [];
for (let i = 0; i < ranges.length; i++) {
    let range = ranges[i];
    for (let z = range[0]; z <= range[1]; z++) {
        temp_allowed.push(...String.fromCodePoint(z).split(""))
        switch (range[2]) {
            case "symbol":
                symbols.push(...String.fromCodePoint(z).split(""))
                break;
            case "emoji":
                emojis.push(...String.fromCodePoint(z).split(""));
                break;

        }
    }
}
symbols = Array.from(new Set(symbols));
emojis = Array.from(new Set(emojis));
let allowed_letters = Array.from((new Set(temp_allowed)));



let bad_words = fs.readFileSync(__dirname + '/badword/badwords.txt').toString().split(', ')
bad_words.forEach(word => spellchecker.add(word));

/**
 * @type {Discord.Collection<string,[number,boolean]>}
 */
let cooldowns = new Discord.Collection()

module.exports = {
    name: 'post',
    description: 'post content to twitter',
    /**
     * @param message {Discord.Message}
     * @param args {string[]}
     */
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            let expires = cooldowns.get(message.author.id);
            let now = Date.now();
            if (!expires[1] && now <= expires[0]) {
                expires[1] = true;
                message.react('⏰');
                message.author.send("Please wait before sending another tweet! " + ((expires[0] - now) / 1000) + "s left");
                cooldowns.set(message.author.id, expires);
                return;
            } else if (now <= expires[0]) return;
        }

        if (message.attachments.size > 0) {
            denyTweet("Attachments are not allowed.")
        }

        let ActualTweet = "";
        var i;
        for (i = 0; i < args.length; i++) {
            let space = " "
            ActualTweet = ActualTweet.concat(space.concat(args[i])) // thank you pie for making this cool converter idea
            // it isnt very practical but it works fine. if i ever get to it i will update this
        }

        for (i = 0; i < ActualTweet.length; i++) { // unicode character check
            if (!allowed_letters.includes(ActualTweet[i])) {
                denyTweet("Tweet contains non standard characters.");
            }
        }
        if (ActualTweet.trim().length == 0) {
            denyTweet("Tweet has no text.");
        }
        /** @type {string} */
        let TweetNoSpace = args.join('').toLowerCase()

        //filter pass 1 (no spaces, no transform)
        if (containsBadWords(TweetNoSpace)) return;

        for (i = 0; i < replace_with.length; i++) {
            TweetNoSpace = TweetNoSpace.split(replace_values[i]).join(replace_with[i])
        }

        //filter pass 2 (replaced texts)
        if (containsBadWords(TweetNoSpace)) return;

        TweetNoSpace = deduplicateString(TweetNoSpace);


        //filter pass 3 (deduplicate string)
        if (containsBadWords(TweetNoSpace)) return;


        //alt filter pass 1 (replace)
        let CorrectedTweet = args.join(" ").toLowerCase();
        for (i = 0; i < replace_with.length; i++) {
            CorrectedTweet = CorrectedTweet.split(replace_values[i]).join(replace_with[i])
        }
        //alt filter pass 2 (corrections)
        CorrectedTweet = await autoCorrect(CorrectedTweet);

        //alt filter pass 3 (remove spaces)
        CorrectedTweet = CorrectedTweet.split(" ").join("");
        if (containsBadWords(CorrectedTweet)) return;

        if (URLRegex.test(ActualTweet)) {
            denyTweet("Tweet contains URL.")
        }
        if (ActualTweet.length > 280) {
            denyTweet("Tweet has passed the character limit")
        }

        T.post('statuses/update', {
            status: ActualTweet + '\n - ' + message.author.tag
        }, function (err, data, response) {
            console.log(data)
            let cooldown = Date.now() + 10000;
            cooldowns.set(message.author.id, [cooldown, false]);
            message.react('✅')
            message.author.send('Tweet has been sent! \n' + `https://twitter.com/${data.user.name}/status/${data.id_str}`)
        })

        /**
         * badwords filter
         * @param {string} str 
         */
        function containsBadWords(str) {
            for (i = 0; i < bad_words.length; i++) {
                if (str.includes(bad_words[i])) {
                    logUser();
                    denyTweet("Tweet contains banned word.");
                    return true;
                }
            }
            return false;
        }

        function denyTweet(txt) {
            let cooldown = Date.now() + 5000;
            cooldowns.set(message.author.id, [cooldown, false]);
            message.react('⛔');
            return message.author.send(txt);
        }

        async function logUser() {
            const embed = new Discord.MessageEmbed()
                .setColor("#FF0000")
                .setTitle("Blacklisted Word")
                .setAuthor("**LOSER:** " + message.author.tag, message.author.avatarURL(), message.url)
                .setDescription(ActualTweet)
                .setFooter("ID: " + message.author.id)
                .setTimestamp();
            /**
             * @type {Discord.TextChannel}
             */
            let channel = await message.client.channels.fetch(config.logChannel)
            channel.send(embed);
        }
    }
}

function deduplicateString(str) {
    let finalStr = "";

    let prevStr = "";
    for (let i = 0; i < str.length; i++) {
        if (str[i] == prevStr) continue;
        prevStr = str[i];
        finalStr += str[i];
    }
    return finalStr;
}

/**
 * @param str {string}
 */
async function autoCorrect(str) {
    let finalStr = str;

    let incorrectSpellings = await spellchecker.checkSpellingAsync(str);

    for (let i = 0; i < incorrectSpellings.length; i++) {
        let indexes = incorrectSpellings[i];
        let wrongWord = str.substring(indexes.start, indexes.end);
        let corrections = spellchecker.getCorrectionsForMisspelling(wrongWord);
        let correction = corrections[0];
        if (correction == undefined) continue;
        finalStr = finalStr.replace(wrongWord, correction);
    }
    return new Promise(res => res(finalStr));
}
