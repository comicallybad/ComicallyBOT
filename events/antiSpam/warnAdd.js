const { s } = require('../../functions.js');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require("common-tags");

module.exports = (client, member) => {
    const logChannel = member.guild.channels.cache.find(c => c.name.includes("mod-logs"));
    if (logChannel) {
        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("Member Warned")
            .setThumbnail(member.guild.me.user.displayAvatarURL())
            .setFooter(member.guild.me.displayName, member.guild.me.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Warned member:** ${member} (${member.id})
            **Warned by:** ${member.guild.me}
            **Reason:** Spam`)
        s(logChannel, '', embed);
    }
    setTimeout(() => {
        let userIndex = client.antiSpam.cache.warnedUsers.indexOf(`${member.id}`);
        client.antiSpam.cache.warnedUsers.splice(userIndex, 1);
    }, 15000)
}