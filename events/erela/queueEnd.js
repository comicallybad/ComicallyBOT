const { s, del } = require("../../functions.js");

module.exports = async (client, player) => {
    const channel = client.channels.cache.get(player.textChannel);
    s(channel, "Queue has ended.").then(m => del(m, 30000));
    return player.destroy();
}