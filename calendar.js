const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis')
const ical = require('node-ical');


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function getEvents(auth) {
  const today = new Date();
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const calendar = google.calendar({version: 'v3', auth});
  const res = await calendar.events.list({
    calendarId: process.env.CALENDAR_ID || 'primary',
    timeMin: today.toISOString(),
    timeMax: tomorrow.toISOString(),
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = res.data.items;
  return events;
}

function getICalEvents(files) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  let events = [];
  files.forEach(file => {
    const icalBody = ical.sync.parseFile(file);
    const icalEvents = Object.keys(icalBody)
      .filter((key) => icalBody[key].type === 'VEVENT')
      .map((key) => icalBody[key])
      .filter((event) => event.start >= today && event.end <= tomorrow)
      .map((event) => {
        let attendees = [];
        if (Array.isArray(event.attendee))
          attendees = event.attendee.map(attendee => ({email: attendee.params.CN}));
        else
          attendees.push({email: event.attendee.params.CN});

        return {
          summary: event.summary,
          description: event.description,
          attendees
        };
      });
    
    events = events.concat(icalEvents);
  });
  return events;
}

module.exports = { authorize, getEvents, getICalEvents };