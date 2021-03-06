const fs = require('fs'),
      readline = require('readline'),
      google = require('googleapis'),
      googleAuth = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Path for tokens
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs.json';

const IAM = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.google/secret/';

// Load client
fs.readFile(IAM + 'gssecret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.
  authorize(JSON.parse(content), createRequest);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function createRequest(auth) {
  request = {
    auth: auth
  };
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter a valid SpreadSheetID (You must have w/r permissions): ', function(code) {
    request.spreadsheetId = code;
    rl.question("Enter path for JSON: ", function(path) {
      rl.close();
      request.resource = JSON.parse(fs.readFileSync(path, 'utf8'));
      addValues(request)
    });
  });
}

function addValues(requestJSON) {
  var sheets = google.sheets('v4');
  sendObject = Object.assign({
    range: "A1",
    includeValuesInResponse: true,
    insertDataOption: "INSERT_ROWS",
    responseDateTimeRenderOption: "FORMATTED_STRING",
    responseValueRenderOption: "UNFORMATTED_VALUE",
    valueInputOption: "RAW"
  },requestJSON);
  sheets.spreadsheets.values.append(sendObject, function(err, response){
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log(response);
  })

  //console.log(sendObject.resource)
}
