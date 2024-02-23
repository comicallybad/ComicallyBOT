const fs = require("fs");

module.exports = async (client, process, code) => {
    const date = new Date();
    const formatDate = `${(date.getMonth() + 1)
        .toString().padStart(2, '0')}-${date.getDate()
            .toString().padStart(2, '0')}-${date.getFullYear()
                .toString().padStart(4, '0')}`

    const formatTime = `${date.getHours()
        .toString().padStart(2, '0')}-${date.getMinutes()
            .toString().padStart(2, '0')}-${date.getSeconds()
                .toString().padStart(2, '0')}`

    var dir = './logs';

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    fs.appendFile(`./logs/${formatDate} exit.log`, `${formatDate} ${formatTime}: A new exit code: ${code}\n`, function (err) {
        if (err) throw err;
        console.error(`A new exit code has been logged to: ${formatDate} exit.log`)
    });

    const owner = await client.users.fetch(`${process.env.USERID}`);
    owner.send(`${formatDate} ${formatTime}: A new exit code:\n\`\`\`prolog\n${code}\`\`\``)
        .catch(err => console.log(`Could not send exit code error message to owner. ${err}`));
}