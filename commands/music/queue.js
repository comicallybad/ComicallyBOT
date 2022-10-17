const { s, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "queue",
    aliases: ["q"],
    category: "music",
    description: "Displays what the current queue is.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player || !player.queue.current)
            return s(message.channel, message.author, "No song currently playing in this guild.").then(m => del(m, 7500));

        let index = 1;
        let string = "";

        if (player.queue.current) string += `__**Currently Playing**__\n ${player.queue.current.title} - **Requested by ${player.queue.current.requester.username}**. \n`;
        if (player.queue[0]) string += `__**Rest of queue:**__\n ${player.queue.slice(0, 10).map(x => `**${index++})** ${x.title} - **Requested by ${x.requester.username}**.`).join("\n")}`;

        const embed = new MessageEmbed()
            .setAuthor({ name: `🎧 Current Queue for ${message.guild.name}`, iconURL: message.guild.iconURL })
            .setThumbnail(player.queue.current.thumbnail)
            .setDescription(string);

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}