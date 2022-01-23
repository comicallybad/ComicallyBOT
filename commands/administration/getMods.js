const { s, r, e, del, pageList } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getmods",
    aliases: ["mods", "listmods", "moderators"],
    category: "moderation",
    description: "Add permitted role for mod commands.",
    permissions: "moderator",
    usage: "<@role | role name>",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Server Bot Moderators")
            .setFooter(message.guild.me.displayName, client.user.displayAvatarURL())
            .setDescription("List of server bot moderators")
            .setTimestamp();

        const m = await s(message.channel, '', embed);

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) return r(message.channel, message.author, "Error within database").then(m => del(m, 7500));
            else {
                let modRoles = exists.modRoles.map(role => " Name: " + `\`${role.roleName}\`` + "  ID: " + `\`${role.roleID}\``)
                if (modRoles.length > 0 && modRoles.length <= 10) {
                    embed.setDescription("").addField("Mod Roles", `${modRoles}`)
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                } else if (modRoles.length > 10) {
                    return pageList(m, message.author, `${modRoles}`, embed, "Mod:")
                } else {
                    embed.setDescription("").addField("Mod Roles", "There have been no bot mods set.")
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                }
            }
        }).catch(err => console.log(err))
    }
}