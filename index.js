require('dotenv').config();

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const calendar = require('./calendar');
const generator = require('./textGenerator');
const { convert } = require('html-to-text');

const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

const optionDefinitions = [
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display this usage guide.'
    },
    {
        name: 'ical',
        type: String,
        multiple: true,
        description: 'iCal files to find events',
        typeLabel: '<files>'
    },
    {
        name: 'event',
        type: String,
        multiple: false,
        description: 'Test event to send',
        typeLabel: '<event>'
    }
]

const options = commandLineArgs(optionDefinitions)

if (options.help) {
    const usage = commandLineUsage([
        {
            header: 'Usage',
            content:  `node index.js`
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        },
        {
            content: 'Project home: {underline https://github.com/sergiogragera/whatsapp-calendar-gpt-bot}'
        }
    ]);
    console.log(usage);
} else {
    const client = new Client({
        authStrategy: new LocalAuth(),
    });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
        try {
            let events = [];
            if (options.event) {
                events = [JSON.parse(options.event)];
            }
            else {
                if (options.ical) {
                    events = calendar.getICalEvents(options.ical);
                }
                else {
                    const calendarAuth = await calendar.authorize();
                    events = await calendar.getEvents(calendarAuth);
                }
            }

            for (const event of events) {
                if (event.summary) {
                    console.info(`Event found: ${event.summary}`);
                    const message = convert(event.description) || await generator.generate(event.summary);
                    console.info(`Generated message: ${message}`);
                    for (const attender of event.attendees) {
                        if (/[0-9]+@[cg].us/.test(attender.email)) {
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
}