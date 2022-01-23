const { s, del, formatDate } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "whois",
    aliases: ["user", "userinfo"],
    category: "info",
    description: "Returns user information.",
    permissions: "member",
    usage: "[@user | userID | user]",
    run: async (client, message, args) => {
        let member;
        if (args[0])
            member = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
        else member = message.member;

        // Member variables
        const joined = formatDate(member.joinedAt);
        const roles = member.roles.cache
            .filter(r => r.id !== message.guild.id)
            .map(r => r).join(", ") || 'none';

        // User variables
        const created = formatDate(member.user.createdAt);

        const embed = new MessageEmbed()
            .setFooter(member.displayName, member.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
            .addField('Member information:', stripIndents`
            **Display name: ${member.displayName}**
            **Joined at: ${joined}**
            **Roles: ${roles}**`, true)
            .addField('User information:', stripIndents`
            **ID: ${member.user.id}**
            **Username: ${member.user.username}**
            **Tag: ${member.user.tag}**
            **Created at: ${created}**`)
            .setTimestamp()

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}