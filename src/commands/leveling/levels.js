const { s, r, del } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "levels",
    aliases: ["level", "levelxp"],
    category: "leveling",
    description: "Shows XP required for levels.",
    permissions: "member",
    usage: "[level]",
    run: (client, message, args) => {
        const embed = new EmbedBuilder()
            .setTitle("XP Levels")
            .setColor("#0efefe")
            .setTimestamp()

        if (args[0]) {
            if (isNaN(args[0]))
                return r(message.channel, message.author, "Please provide a valid level.").then(m => del(m, 7500));
            else
                return r(message.channel, message.author, `${10 * Math.pow(args[0], 3) / 5 + 25} XP is required for level ${args[0]}`).then(m => del(m, 7500));
        } else {
            for (let i = 0; i < 10; i++) {
                let XP = 10 * Math.pow(i + 1, 3) / 5 + 25;
                embed.addFields({ name: `XP for level ${i + 1}`, value: `${XP} XP` });
            }
            return s(message.channel, '', embed).then(m => del(m, 30000));
        }
    }
}
