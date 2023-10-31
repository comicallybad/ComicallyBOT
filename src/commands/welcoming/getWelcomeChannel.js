const db = require("../../../utils/schemas/db.js");
const { r, del } = require("../../../utils/functions/functions.js");

module.exports = {
    name: "getwelcomechannel",
    aliases: ["getwelcomech", "welcomech"],
    category: "welcoming",
    description: "Adds a welcome channel where welcome message will be sent when a user joins.",
    permissions: "moderator",
    run: (client, message, args) => {
        return db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "welcome" } } }, async (err, exists) => {
            if (!exists) return r(message.channel, message.author, "There has been no welcome channel set.").then(m => del(m, 7500));
            let channel = await client.channels.fetch(exists.channels.filter(x => x.command === "welcome")[0].channelID);
            return r(message.channel, message.author, `The welcome channel is: ${channel}.`).then(m => del(m, 30000));
        }).catch(err => err);
    }
}