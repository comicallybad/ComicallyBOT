const db = require("./schemas/db.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    async del(message, timeout) {
        if (message && message.id) { //Fix in case bad message
            setTimeout(function () {
                if (message.deletable && !message.reactions.cache.get("🛑")) {  //messages can now stop from being deleted
                    message.delete({ timeout: 0 }).catch(err => err); //This gets rid of the annoying "Unknown Message" error.
                } else {
                    message.reactions.removeAll().catch(err => err); //This gets rid of the annoying "Unknown Message" error.
                }
            }, timeout);
        }
    },

    async hasPermissions(message, commandType) {
        let guildID = message.guild.id;
        let roleIDs = message.member.roles.cache.map(roles => roles.id);
        let userID = message.member.id;

        if (commandType === "everyone") return true;
        else if (message.member.hasPermission("ADMINISTRATOR")
            || message.author.id === process.env.USERID) return true;
        else {
            let permissions = await db.findOne({ guildID: guildID });
            if (!permissions) return false;

            let modRolesIDs = permissions.modRoles.map(role => role.roleID);
            let memberRolesIDs = permissions.memberRoles.map(role => role.roleID);

            if (commandType === "moderator") {
                if (modRolesIDs.includes(userID)) return true;
                else return modRolesIDs.some(id => roleIDs.includes(id));
            } else if (commandType === "member") {
                if (memberRolesIDs.includes(userID)) return true;
                else return memberRolesIDs.some(id => roleIDs.includes(id));
            }
        }
    },

    async getCommandStatus(message, command) {
        let commandStatus = await db.findOne({
            guildID: message.guild.id,
            commands: { $elemMatch: { name: command } }
        });

        return commandStatus.commands[commandStatus.commands.map(cmd => cmd.name).indexOf(command)].status === true;
    },

    findID(message, input, type) {
        let roleIDs = message.guild.roles.cache.map(role => role.id);
        let userIDs = message.guild.members.cache.map(user => user.user.id);
        let mention = input.replace(/\D/g, "");

        if (!type || type === "either") {
            if (roleIDs.includes(input)) return input;
            else if (roleIDs.includes(mention)) return mention;
            else if (userIDs.includes(input)) return input;
            else if (userIDs.includes(mention)) return mention;
            else return undefined;
        } else if (type === "user") {
            if (userIDs.includes(input)) return input;
            else if (userIDs.includes(mention)) return mention;
            else return undefined;
        } else if (type === "role") {
            if (roleIDs.includes(input)) return input;
            else if (roleIDs.includes(mention)) return mention;
            else return undefined;
        }
    },

    getMember(message, toFind = "") {
        toFind = toFind.toLowerCase();

        let target = message.guild.members.cache.get(toFind);

        if (!target && message.mentions.members)
            target = message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                    member.user.tag.toLowerCase().includes(toFind);
            });
        }

        if (!target)
            target = message.member;

        return target;
    },

    formatDate(date) {
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString().padStart(2, "0");
        let day = date.getDate().toString().padStart(2, "0");

        return month + "/" + day + "/" + year;
    },

    //Adds certain reactions, returns first user
    async promptMessage(message, author, time, validReactions) {
        time *= 1000;

        for (const reaction of validReactions) await message.react(reaction);

        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;

        return message
            .awaitReactions(filter, { max: 1, time: time })
            .then(collected => collected.first() && collected.first().emoji.name).catch(err => console.log(`There was an error in prompMesssage ${err}`));
    },

    //Adds certain reaction, waits for certain amount of reactions, waits certain amount of time, returns all user objects
    async awaitReaction(message, max, time, emoji) {
        await message.react(emoji);

        const filter = (reaction, user) => emoji === reaction.emoji.name && user.id !== message.author.id;
        return message
            .awaitReactions(filter, { max: max, time: time })
            .then(collected => collected.first()
                ? [...collected.first().users.cache.values()].filter(u => !u.bot)
                : []
            ).catch(err => console.log(`There was an error in awaitReaction ${err}`));
    },

    async pageList(message, author, array, embed, parameter) {
        let size = 10;
        let page = 0;

        for (let i = 0; i < size && i < array.length; i++) {
            embed.addField(`${parameter} ${i + 1}`, array[i]);
        }

        await message.edit(embed);

        await module.exports.pageTurn(message, author, array, embed, parameter, size, page);
    },

    async pageTurn(message, author, array, embed, parameter, size, page) {
        let pages = Math.ceil(array.length / size) - 1; //subtract 1 because page starts at 0
        let newPage = page;
        embed.fields = [];

        for (let i = newPage * size; i < (newPage + 1) * size && i < array.length; i++) {
            embed.addField(`${parameter} ${i + 1}`, array[i]);
        }

        await message.edit(embed);

        if (newPage === 0) {
            const reacted = await module.exports.promptMessage(message, author, 15, ["➡️", "🗑️"]);
            if (reacted === "➡️") {
                message.reactions.removeAll().then(() => {
                    newPage++;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                }).catch(err => err);
            } else if (reacted === "🗑️") {
                return module.exports.del(message, 0);
            } else return module.exports.del(message, 0);
        } else if (newPage !== 0 && newPage !== pages) {
            const reacted = await module.exports.promptMessage(message, author, 15, ["⬅️", "➡️", "🗑️"]);
            if (reacted === "➡️") {
                message.reactions.removeAll().then(() => {
                    newPage++;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                }).catch(err => err);
            } else if (reacted === "⬅️") {
                message.reactions.removeAll().then(() => {
                    newPage--;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                }).catch(err => err);
            } else if (reacted === "🗑️") {
                await module.exports.del(message, 0);
            } else return module.exports.del(message, 0);
        } else if (newPage === pages) {
            const reacted = await module.exports.promptMessage(message, author, 15, ["⬅️", "🗑️"]);
            if (reacted === "⬅️") {
                message.reactions.removeAll().then(() => {
                    newPage--;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                }).catch(err => err);
            } else if (reacted === "🗑️") {
                return module.exports.del(message, 0);
            } else return module.exports.del(message, 0);
        }
    },

    async checkMuteRole(message) {
        let muteRole = message.guild.roles.cache.find(r => r.name === "Muted");
        if (!muteRole) {
            try {
                muteRole = await message.guild.roles.create({
                    data: {
                        name: "Muted",
                        color: "#778899",
                        permissions: []
                    }
                });

                for (const [, channel] of message.guild.channels.cache) {
                    await channel.updateOverwrite(muteRole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                        SEND_TTS_MESSAGES: false,
                        ATTACH_FILES: false,
                        SPEAK: false,
                        CONNECT: false
                    });
                }
            } catch (e) {
                console.log("Error creating muterole. Guild: ", message.guild.id, "\n", e.stack);
                return;
            }
        }

        return muteRole;
    },

    async bulkDeleteCount(message) {
        return await message.channel.messages.fetch({ limit: spamUsers.find(user => user.id === message.author.id).offences }).then(messages => {
            const spamMessages = messages.filter(msg => !!msg.member);

            message.channel.bulkDelete(spamMessages)
                .catch(err => message.channel.send("I am missing permissions to `MANAGE_MESSAGES` to delete spam messages."))
                .then(m => module.exports.del(m, 7500));

            return spamMessages.array().length;
        }).catch(err => {
            return undefined;
        });
    },

    async warn(message, userArray, type) {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("User Warned")
            .setThumbnail(message.guild.me.user.displayAvatarURL())
            .setFooter(message.guild.me.displayName, message.guild.me.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Member warned for ${type}:** ${message.member} (${message.author.id})
            **Warned by:** ${message.guild.me}`);

        if (type === "spam") {
            let messagesDeleted = await module.exports.bulkDeleteCount(message);
            embed.addField("Messages Deleted", messagesDeleted);
        } else if (type === "profanity") embed.addField("Message Deleted", message.content);

        if (userArray.some(user => user.id === message.author.id)) {
            userArray.find(user => user.id === message.author.id).offences += 1;

            if (userArray.some(user => user.id === message.author.id && user.offences < 3)) {
                await logChannel.send(embed);
                return message.reply(`You will be muted for ${type} if this continues.`).then(m => module.exports.del(m, 7500));
            } else if (userArray.some(user => user.id === message.author.id && user.offences === 3)) {
                await module.exports.punish(message, userArray, type);
            } else if (userArray.some(user => user.id === message.author.id && user.offences === 4)) {
                await logChannel.send(embed);
                return message.reply(`You will be muted for ${type} if this continues.`).then(m => module.exports.del(m, 7500));
            } else if (userArray.some(user => user.id === message.author.id && user.offences === 5)) {
                await module.exports.punish(message, userArray, type);
            }
        } else {
            userArray.push({ id: message.author.id, offences: 1 });
            await logChannel.send(embed);
            return message.reply(`Your messages were deleted for ${type}.`).then(m => module.exports.del(m, 7500));
        }
    },

    async punish(message, userArray, reason) {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("User Muted")
            .setThumbnail(message.guild.me.user.displayAvatarURL())
            .setFooter(message.guild.me.displayName, message.guild.me.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Muted member:** ${message.member} (${message.author.id})
            **Muted by:** ${message.guild.me}
            **Reason:** ${reason}`);

        if (message.guild.me.hasPermission("MANAGE_ROLES")) {
            if (userArray.some(user => user.id === message.author.id && user.offences === 5)) {
                let muterole = await module.exports.checkMuteRole(message);
                message.member.roles.add(muterole.id).then(() => {
                    message.member.send(`Hello, you have been **muted** **for 5 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    message.reply(`${message.member.user.username} was successfully muted **5 minutes** for **${reason}**.`).then(m => module.exports.del(m, 7500));
                    embed.addField("Mute Time: ", "5 minutes");
                    logChannel.send(embed);
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to mute ${message.member} ${err}`)
                        .then(m => module.exports.del(m, 7500));
                }).then(setTimeout(() => {
                    message.member.roles.remove(muterole.id).then(() => {
                        message.member.send(`Hello, you have now been **unmuted** in ${message.guild.name} `)
                            .catch(err => err); //in case DMs are closed

                        message.reply(`${message.member.user.username} was successfully unmuted.`)
                            .then(m => module.exports.del(m, 7500));
                    }).catch(err => {
                        if (err) return message.reply(`There was an error attempting to unmute ${message.member} ${err}`)
                            .then(m => module.exports.del(m, 7500));
                    });
                }, 300000)).catch(err => err); //5 Minute punishment 300000
            } else if (userArray.some(user => user.id === message.author.id && user.offences === 7)) {
                let muterole = await module.exports.checkMuteRole(message);
                message.member.roles.add(muterole.id).then(() => {
                    message.member.send(`Hello, you have been **muted** **for 10 minutes** in ${message.guild.name} for: **${reason}**`)
                        .catch(err => err); //in case DMs are closed

                    message.reply(`${message.member.user.username} was successfully muted **10 minutes** for **${reason}**.`)
                        .then(m => module.exports.del(m, 7500));

                    embed.addField("Mute Time: ", "10 minutes");
                    logChannel.send(embed);
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to mute ${message.member} ${err}`)
                        .then(m => module.exports.del(m, 7500));
                }).then(setTimeout(() => {
                    userArray.splice(userArray.findIndex(user => user.id === message.author.id), 1);
                    message.member.roles.remove(muterole.id).then(() => {
                        message.member.send(`Hello, you have now been **unmuted** in ${message.guild.name} `).catch(err => err); //in case DM's are closed
                        message.reply(`${message.member.user.username} was successfully unmuted.`).then(m => module.exports.del(m, 7500));
                    }).catch(err => {
                        if (err) return message.reply(`There was an error attempting to unmute ${message.member} ${err}`)
                            .then(m => module.exports.del(m, 7500));
                    });
                }, 600000)).catch(err => err); // 5 Minute punishment 600000
            }
        } else {
            message.channel.send("I am missing permissions to `MANAGE_ROLES` to mute users for spam/profanity.").then(m => module.exports.del(m, 7500)
                .catch(err => err));
        }
    }
};