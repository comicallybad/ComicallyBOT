const { r, del } = require("../../functions.js");

module.exports = {
    name: "trackrepeat",
    aliases: ["songrepeat", "repeatsong"],
    category: "music",
    description: "Makes the bot repeat the song currently playing.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player) return r(message.channel, message.author, "No song/s currently playing in this guild.");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return r(message.channel, message.author, "You need to be the voice channel to pause music.").then(m => del(m, 7500));

        if (player.trackRepeat)
            player.setTrackRepeat(false);
        else
            player.setTrackRepeat(true);

        return r(message.channel, message.author, `Track reapeat is now ${player.trackRepeat ? "enabled" : "disabled"}.`).then(m => del(m, 7500));
    }
}