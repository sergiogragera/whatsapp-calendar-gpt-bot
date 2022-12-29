require('dotenv').config();

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const calendar = require('./calendar');
const generator = require('./textGenerator');
const { convert } = require('html-to-text');

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
            if (event.summary) {
                console.info(`Event found: ${event.summary}`);
                const message = convert(event.description) || await generator.generate(event.summary);
                console.info(`Generated message: ${message}`);
                for (const attender of event.attendees) {
                    if (/[0-9]+@c.us/.test(attender.email)) {
                        console.info(`Sending message to ${attender.email}`);
                        await client.sendMessage(attender.email, message);
                        console.info(`Message delivered to ${attender.email}`);
                    }
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
});

client.initialize();