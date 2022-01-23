const { r, del } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getrankchannel",
    aliases: ["getrankch", "rankchannelget"],
    category: "leveling",
    description: "Get response channel for leveling.",
    permissions: "moderator",
    run: (client, message, args) => {
        let guildID = message.guild.id;

        db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "rank" } } }, (err, exists) => {
            if (!exists) return r(message.channel, message.author, "Channel has not been set.").then(m => del(m, 7500));
            else return r(message.channel, message.author, `Levelling's response channel is: <#${exists.channels[exists.channels.map(cmd => cmd.command).indexOf("rank")].channelID}>`).then(m => del(m, 15000));
        }).catch(err => console.log(err))
    }
}