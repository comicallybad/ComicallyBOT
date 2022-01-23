const db = require("../../schemas/db.js");
const { r, del } = require("../../functions.js")

module.exports = {
    name: "removesuggestchannel",
    aliases: ["removesuggestch", "rmsuggestch"],
    category: "suggestion",
    description: "Removes the suggestion channel.",
    permissions: "moderator",
    run: (client, message, args) => {
        db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "verify" } } }, (err, exists) => {
            if (exists) {
                db.updateOne({ guildID: message.guild.id, 'channels.command': "verify" }, {
                    $pull: { channels: { command: "verify" } }
                }).catch(err => console.log(err));
                return r(message.channel, message.author, "Removed verify channel.").then(m => del(m, 7500));
            }
            else return r(message.channel, message.author, "There has been no verify channel set.").then(m => del(m, 7500));
        });
    }
}