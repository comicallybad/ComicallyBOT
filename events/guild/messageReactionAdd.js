const db = require("../../schemas/db.js");
const { s, del } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");

module.exports = async (client, message, user) => {
    if (!client.guilds.cache.get(message.message.guildId).me.permissions.has("MANAGE_ROLES"))
        return;

    if (user.id !== client.user.id) {
        if (message.partial) {
            message.fetch().then(fullMessage => {
                checkReactionRole(fullMessage, user);
            }).catch(err => err); //Error handling for not being able to fetch message
        } else {
            checkReactionRole(message, user);
        }
    }
}

function checkReactionRole(message, user) {
    let logChannel;
    if (message.message.guild.channels)
        logChannel = message.message.guild.channels.cache.find(c => c.name.includes("reaction-logs"));
    if (!logChannel) message.message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;
    let guildUser = message.message.guild.members.cache.get(user.id);
    let guildID = message.message.guild.id;

    let messageID = message.message.id;
    let reaction;

    if (!message._emoji.id) reaction = message._emoji.name;
    else reaction = message._emoji.id;

    const embed = new MessageEmbed()
        .setColor("#00FF00")
        .setTitle("Member joined role via Reaction Role")
        .setFooter({ text: `${user.tag}`, iconURL: user.displayAvatarURL() })
        .setThumbnail(guildUser.user.displayAvatarURL())
        .setTimestamp()

    db.findOne({
        guildID: guildID,
        reactionRoles: { $elemMatch: { messageID: messageID, reaction: reaction } }
    }, (err, exists) => {
        if (!exists) return;
        const roles = exists.reactionRoles.filter(rr => rr.messageID == messageID && rr.reaction == reaction);
        roles.forEach(role => {
            if (guildUser.roles.cache.get(role.roleID)) return;
            guildUser.roles.add(role.roleID).then(() => {
                embed.setDescription(`**Member:** ${user} ${user.id}\n**Role: ${role.roleName}** (${role.roleID})`);
                if (logChannel) s(logChannel, '', embed);
            }).catch(err => {
                if (!message.message.channel.permissionsFor(message.message.guild.me).has("SEND_MESSAGES")) return;
                else return s(message.message.channel, `${user} there was an issue assigning you the **${role.roleName}** ${err}`).then(m => del(m, 7500));
            });
        });
    });
}
