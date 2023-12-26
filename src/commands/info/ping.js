const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Returns ping and latency of the bot.'),
    execute: async (interaction, client) => {
        const message = await interaction.deferReply({
            fetchReply: true
        });

        await interaction.editReply({
            content: `Api Latency: ${client.ws.ping}\nClient Ping: ${message.createdTimestamp - interaction.createdTimestamp}`
        });
    }
}