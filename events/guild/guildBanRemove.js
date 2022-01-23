const { s } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");

module.exports = async (client, guild, user) => {
    if (guild.channels) {
        let logChannel = await guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

        if (logChannel) {
            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("Member Unbanned")
                .setThumbnail(user.displayAvatarURL())
                .setDescription(`${user} ${user.tag}`)
                .setFooter(`ID: ${user.id}`)
                .setTimestamp()

            return s(logChannel, '', embed);
        }
    }
}
