const { readdirSync } = require("fs")

module.exports = (client) => {
    const load = () => {
        const events = readdirSync(`./events/erela/`).filter(d => d.endsWith('.js'));
        for (let file of events) {
            const evt = require(`../events/erela/${file}`);
            let eName = file.split('.')[0];
            client.music.on(eName, evt.bind(null, client));
        };
    };
    ["erela"].forEach(x => load(x));
};