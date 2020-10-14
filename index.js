const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const request = require('request');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const jsonToken = require('..\\token.json')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = '..\\token.json';

module.exports = {
    auth: authorize,
    getNT: getNewToken,
    lms: listMessages,
    lm: listMessage,
    ml: messagelister
}


// Load client secrets from a local file.
fs.readFile('..\\credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  //authorize(JSON.parse(content), listLabels);
  const json = authorize(JSON.parse(content), messagelister);
});





/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.web;
  var oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
    
  });
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
      
    });
  });

}


function listMessages(auth, query) {
  return new Promise((resolve, reject) => {
    const gmail = google.gmail({version: 'v1', auth});
    
    gmail.users.messages.list(
      {
        userId: 'me',
        q: query,
      },
      (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        if (!res.data.messages) {
          resolve([]);
          return;
        }
        resolve(res.data.messages);
      }
    );
  });

}



function listMessage(auth, message) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.messages.get({
    "userId": "gohas6875@gmail.com",
    "id": message
  })
  .then(function(response) {
          // Handle the results here (response.result has the parsed body).
        
          'use strict';
        let buff = (Buffer.from(response.data.payload.parts[0].body.data, 'base64')).toString();
        for (i in response.data.payload.headers){
          if (response.data.payload.headers[i].name == "From"){
            sender = response.data.payload.headers[i].value
          }
        }
        const respArray = [buff, sender]
         console.log("Response" , respArray);
        },
        function(err) { console.error("Execute error", err); });
}

  async function messagelister(oAuth2Client){
  const text = JSON.parse(await readFile('..\\token.json', 'utf8')).access_token;
  const messages = await listMessages(oAuth2Client, 'label:inbox subject:reminder');  
  const gmail = google.gmail({version: 'v1', oAuth2Client});

  //console.log(oAuth2Client);
  for (message of messages){
    message_id = message.id;
    listMessage(oAuth2Client, message_id);
    
  }

}

