const { s, r, del } = require("../../functions");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "nickname",
    aliases: ["nick", "changename"],
    category: "helpful",
    description: "Changes a user's nickname.",
    permissions: "moderator",
    usage: "<@user | userID> <nickname>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a user.").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide a new nickname.").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("MANAGE_NICKNAMES"))
            return r(message.channel, message.author, "I don't have permission to manage nicknames!").then(m => del(m, 7500));

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) return r(message.channel, message.author, "Please supply a user to be banned!").then(m => del(m, 7500));

        let nickName = args.splice(1).join(' ');

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Member Nickname Changed")
            .setThumbnail(user.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Member changed:** ${user} (${user.id})
            **Nickname changed to:** ${nickName}
            **Nickname changed by:** ${message.author}`);

        user.setNickname(nickName, '')
            .then(() => {
                r(message.channel, message.author, "User's nickname was successfully changed.").then(m => del(m, 7500));
                return s(logChannel, '', embed);
            }).catch(err => r(message.channel, message.author, "I can't change that users nickname due to role hierarchy, I suppose.").then(m => del(m, 7500)));
    }
}