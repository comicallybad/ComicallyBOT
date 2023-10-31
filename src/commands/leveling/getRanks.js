const { s, e, del } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");
const { EmbedBuilder } = require("discord.js")

module.exports = {
    name: "getranks",
    aliases: ["ranks"],
    category: "leveling",
    description: "List of ranks that can be purchased with coins.",
    permissions: "member",
    run: async (client, message, args) => {
        const guildID = message.guild.id;

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setTitle("XP Level Ranks")
            .setFooter({ text: message.guild.me.displayName, iconURL: client.user.displayAvatarURL() })
            .setDescription("List of XP Level ranks")
            .setTimestamp();

        const m = await s(message.channel, '', embed);

        return db.findOne({ guildID: guildID }, (err, exists) => {
            let rankList = exists.xpRoles;
            if (!exists) return r(message.channel, message.author, "Error within database").then(m => del(m, 7500));
            if (rankList.length > 0 && rankList.length <= 10) {
                rankList.forEach((rank, index) => {
                    embed.addFields({ name: `Rank: ${index + 1}`, value: `Name: \`${rank.roleName}\`  ID: \`${rank.roleID}\` Level: \`${rank.level}\`` });
                });
                return e(m, m.channel, '', embed).then(del(m, 30000));
            } else if (rankList.length > 10) {
                return pageList(m, message.author, `${rankList}`, embed, "Rank:", 10, 0);
            } else {
                embed.setDescription("").addFields({ name: "Ranks", value: "There have been no ranks set." });
                return e(m, m.channel, '', embed).then(del(m, 30000));
            }
        }).catch(err => err)
    }
}
