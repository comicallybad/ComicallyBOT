const mongoose = require("mongoose");
const db = require("../../schemas/db.js");

module.exports = (client, guild) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`], i = 0;
    let commands = (client.commands.map(cmd => cmd.name));

    db.findOne({ guildID: guild.id }, (err, exists) => {
        if (!exists) {
            const newDB = new db({
                _id: mongoose.Types.ObjectId(),
                guildID: guild.id,
                guildName: guild.name,
                memberRoles: [],
                modRoles: [],
                verificationRole: [],
                commands: [],
                channels: [],
                xpRoles: [],
                xpMultiplier: 1,
                xpSystem: false,
                profanityFilter: false,
                antiSpam: false,
                antiPhishing: false,
                reactionRoles: [],
                badWordList: [],
                welcomeMessage: [],
                welcomeMessageReactions: [],
            })
            newDB.save().catch(err => console.log(err))
        } else {
            exists.guildName = guild.name; //in case name changed
            exists.save().catch(err => console.log(err))
        }
    }).clone().then(() => {
        commands.forEach((element, cmdIndex) => {
            db.findOne({
                guildID: guild.id,
                commands: { $elemMatch: { name: commands[cmdIndex] } }
            }, (err, exists) => {
                if (!exists) {
                    db.updateOne({ guildID: guild.id }, {
                        $push: { commands: { name: commands[cmdIndex], status: true } }
                    }).clone().catch(err => console.log(err))
                }
            })
        });
    }).catch(err => console.log(err))
}