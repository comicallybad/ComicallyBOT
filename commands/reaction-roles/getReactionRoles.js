const { s, e, del, pageList } = require("../../functions");
const db = require("../../schemas/db.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "getreactionroles",
    aliases: ["getrr"],
    category: "reaction-roles",
    description: "Gets a list of active reaction roles.",
    permissions: "moderator",
    run: async (client, message, args) => {
        let guildID = message.guild.id;

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Reaction Roles")
            .setFooter(message.guild.me.displayName, client.user.displayAvatarURL())
            .setDescription("List of server reaction roles.")
            .setTimestamp();

        const m = await s(message.channel, '', embed);

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists) {
                let reactionRoles = exists.reactionRoles
                if (reactionRoles.length > 0) {
                    if (reactionRoles.length <= 10) {
                        reactionRoles.forEach((rr, index) => {
                            embed.addField(`Reaction Role ${index + 1}:`, `MessageID: \`${rr.messageID}\`  Reaction: \`${rr.reaction}\` Role: \`${rr.roleName}(${rr.roleID})\` Type: \`${rr.type}\`,`)
                        });
                        return e(m, m.channel, '', embed).then(del(m, 30000));
                    } else {
                        let array = reactionRoles.map(rr => `MessageID: \`${rr.messageID}\`  Reaction: \`${rr.reaction}\` Role: \`${rr.roleName}(${rr.roleID})\` Type: \`${rr.type}\`,`)
                        pageList(m, message.author, array, embed, "Reaction Role")
                    }
                } else {
                    embed.setDescription("").addField("Reaction Roles", "There have been no reaction roles set.")
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                }
            }
        }).catch(err => console.log(err))
    }
}