const { s, r, del } = require("../../functions");
const db = require("../../schemas/db.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "toggleantiphishing",
    aliases: ["antisphishingtoggle"],
    category: "auto-moderation",
    description: "Toggles the anti-phishing link system on or off.",
    permissions: "moderator",
    usage: "<on/true/enable | off/false/disable>",
    run: (client, message, args) => {
        if (!message.guild.me.permissions.has("MANAGE_MESSAGES"))
            return r(message.channel, message.author, "I need `MANAGE_MESSAGES` permissions for the anti-phishing system.").then(m => del(m, 7500));

        if (!args[0])
            return r(message.channel, message.author, "Please provide a true/false or enable/disable.").then(m => del(m, 7500));

        if (args[0] !== "true" && args[0] !== "enable"
            && args[0] !== "false" && args[0] !== "disable"
            && args[0] !== "on" && args[0] !== "off") {
            return r(message.channel, message.author, "Please provide an on/off, true/false or enable/disable.").then(m => del(m, 7500));
        }

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;
        let bool;

        if (args[0] === "true" || args[0] === "enable" || args[0] === "on") bool = true;
        else bool = false;

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Anti-Phishing Toggled")
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Anti-Phising toggled By:** ${message.member.user}
            **Anti-Phishing toggled To:** ${bool}`);

        db.updateOne({ guildID: guildID }, {
            $set: { antiPhishing: bool }
        }).catch(err => err);

        s(logChannel, '', embed);
        return r(message.channel, message.author, `The anti-phishing system has been toggled to ${args[0]}.`).then(m => del(m, 7500));
    }
}