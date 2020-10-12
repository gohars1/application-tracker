const fs = require('fs');
const index = require('./index')

// Load client secrets from a local file.
async function saveMessages(){ 
    try {
    await fs.readFile('..\\credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    // authorize(JSON.parse(content), listLabels);
    return index.auth(JSON.parse(content), index.ml);
  });
    }
    catch (err){

    }
    

}
function parseMessages(messages){
    
}