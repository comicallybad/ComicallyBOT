const { s } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = async (client, ban) => {
    if (!message.guild.me.permissions.has("VIEW_AUDIT_LOG"))
        return;

    let logChannel = await ban.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

    try {
        const fetchedLogs = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD',
        });

        const banLog = fetchedLogs.entries.first();

        if (!banLog) {
            const embed = new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("Member Banned")
                .setThumbnail(ban.user.displayAvatarURL())
                .setFooter({ text: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
                .setTimestamp()
                .setDescription(stripIndents`
                **User Banned By:** No audit log could be found. Unknown User.
                **User Banned:** ${ban.userName} (${ban.user.id})`);

            return s(logChannel, '', embed);
        }

        const { executor, target } = banLog;
        if (target.id === ban.user.id) {
            if (logChannel) {
                const embed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setTitle("Member Banned")
                    .setThumbnail(ban.user.displayAvatarURL())
                    .setFooter({ text: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(stripIndents`
                    **User Banned By:** ${executor} (${executor.id})
                    **User Banned:** ${ban.user} (${ban.user.id})
                    **Reason:** ${banLog.reason ? banLog.reason : "No reason given!"}`);

                return s(logChannel, '', embed);
            }
        } else {
            if (logChannel) {
                const embed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setTitle("Member Banned")
                    .setThumbnail(ban.user.displayAvatarURL())
                    .setFooter({ text: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(`${ban.user} (${ban.user.d})`);

                return s(logChannel, '', embed);
            }
        }
    } catch (err) {
        return;
    }
}
