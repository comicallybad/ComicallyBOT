const db = require("../../schemas/db.js");
const xp = require("../../schemas/xp.js")

module.exports = (client, guild) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`], i = 0;
    db.deleteOne({ guildID: guild.id }, {
    }).catch(err => console.log(err))
    xp.deleteMany({ guildID: guild.id }, {
    }).catch(err => console.log(err))
}