const { r, del } = require("../../functions.js");

module.exports = {
    name: "clear",
    aliases: ["purge", "clean"],
    category: "moderation",
    description: "Clears the chat.",
    permissions: "moderator",
    usage: "[@user | userID]<number of messages>",
    run: async (client, message, args) => {
        if (!message.guild.me.permissions.has("MANAGE_MESSAGES"))
            return r(message.channel, message.author, "I do not have permissions to delete messages.").then(m => del(m, 7500));

        if (!args[1]) {
            if (isNaN(args[0]) || parseInt(args[0]) <= 0)
                return r(message.channel, message.author, "Please provide a valid number.").then(m => del(m, 7500));

            let deleteAmount;

            if (parseInt(args[0]) >= 100) deleteAmount = 99;
            else deleteAmount = parseInt(args[0]);

            message.channel.bulkDelete(deleteAmount + 1, true)
                .catch(err => r(message.channel, message.author, `Something went wrong ${err}`).then(m => del(m, 7500)));
        } else if (args[1]) {
            if (isNaN(args[1]) || parseInt(args[1]) <= 0)
                return r(message.channel, message.author, "Please provide a valid number.").then(m => del(m, 7500));

            let deleteAmount;

            if (parseInt(args[1]) > 100) deleteAmount = 99;
            else deleteAmount = parseInt(args[1]);

            if (parseInt(args[0]) > 1000000) {
                let user = message.guild.members.fetch(`${args[0]}`).catch(err => r(message.channel, message.author, "Could not find user with that ID.").then(m => del(m, 7500)));
                if (user) {
                    message.channel.messages.fetch({ limit: 100 }).then((messages) => {
                        const filterBy = user.id;
                        messages = messages.filter(m => m.author.id === filterBy).array().slice(0, (deleteAmount + 1));
                        message.channel.bulkDelete(messages).catch(err => {
                            return r(message.channel, message.author, `There was an error attempting to delete user messages: ${err}`)
                        });
                    });
                }
            }

            if (message.mentions.users.first()) {
                message.channel.messages.fetch({ limit: 100 }).then((messages) => {
                    const filterBy = message.mentions.users.first() ? message.mentions.users.first().id : Client.user.id;
                    messages = messages.filter(m => m.author.id === filterBy).array().slice(0, (deleteAmount + 1));
                    message.channel.bulkDelete(messages).catch(err => {
                        return r(message.channel, message.author, `There was an error attempting to delete user messages: ${err}`)
                    });
                });
            } else {
                let user = await client.users.fetch(args[0]);

                if (user) {
                    if (isNaN(args[1]) || parseInt(args[1]) <= 0)
                        return r(message.channel, message.author, "Please provide a valid number.").then(m => del(m, 7500));

                    let deleteAmount;

                    if (parseInt(args[1]) > 100) deleteAmount = 99;
                    else deleteAmount = parseInt(args[1]);

                    message.channel.messages.fetch({ limit: 100 }).then((messages) => {
                        const filterBy = user ? user.id : Client.user.id;
                        messages = messages.filter(m => m.author.id === filterBy).array().slice(0, (deleteAmount + 1));
                        message.channel.bulkDelete(messages).catch(err => {
                            return r(message.channel, message.author, `There was an error attempting to delete user messages: ${err}`);
                        });
                    });
                } else return r(message.channel, message.author, "Sorry, I could not find that user.").then(m => del(m, 7500));
            }
        }
    }
}