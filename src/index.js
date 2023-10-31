require('dotenv').config();
const { ShardingManager } = require('discord.js');

const manager = new ShardingManager('./src/client.js', { token: process.env.TOKEN, totalShards: 'auto', shardList: "auto" });

manager.on('shardCreate', async (shard) => console.log(`Launched shard ${shard.id}`));

manager.spawn(manager.totalShards, 10000);