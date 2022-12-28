# WhastApp Calendar GPT Bot

This bot sends AI generated WhatsApp messages with the subject of the retrieved Google Calendar event for today.

If the event is "Write congratulations message for my friend Peter", this command will be sent to openai.com and send generated result to WhatsApp account with id wid@us.c where wid is the number phone number with prefix (in the style of 34[0-9]{9} or the WhatsApp group id).

If my personal number is +00 123 456 789, the text of the description would be 0012345678 and that will generate a message for the account 00123456789@us.c.

# Configuration

Create an .env file or define the following environment variables:

```
OPENAI_SECRET_KEY
CALENDAR_ID (primary by default)
```

1. Generate your OpenAI API key from https://beta.openai.com/account/api-keys
![](resources/openai.png)
2. Get calendar ID from Google Calendar settings
3. Get credentials.json file from Google Console with credentials config

Enable Calendar API and generate OAuth desktop client credential from https://console.cloud.google.com/apis/credentials and save JSON file as credentials.json

# Run

* Generate event in Google Calendar with summary "Write congratulations message for my friend Peter" and description "00123456789"
![](resources/event.png)
* Install the dependencies with `npm i`
* Start the NodeJS script with `node index.js`
* Link the whatsapp account by scanning the QR code that shows the terminal

# Dependencies

* https://wwebjs.dev/
* https://beta.openai.com
* https://developers.google.com/calendar/api/quickstart/nodejs