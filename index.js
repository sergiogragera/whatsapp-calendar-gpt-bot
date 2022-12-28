require('dotenv').config();

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { convert } = require('html-to-text');
const calendar = require('./calendar');
const generator = require('./textGenerator');

const client = new Client({
    authStrategy: new LocalAuth(),
})

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
    try {
        const calendarAuth = await calendar.authorize();
        const events = await calendar.getEvents(calendarAuth);
        for (const event of events) {
            const message = await generator.generate(event.summary)
            if (event.description) {
                const whatsappId = convert(event.description).replace(/\n/g,'');
                if (whatsappId.length > 0)
                    client.sendMessage(`${whatsappId}@g.us`, message);
            }
        }
    } catch (err) {
        console.log(err);
    }
    process.exit();
});

client.initialize();