const fs = require('fs'),
      readline = require('readline'),
      google = require('googleapis'),
      googleAuth = require('google-auth-library'),
      SCOPES = ['https://www.googleapis.com/auth/spreadsheets'],
      AWS = require('aws-sdk'),
      S3 = new AWS.S3();

const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json'
        }
    });
function getS3Obj(key, callback){
  var paramsS3Object = {
    Bucket: 'coconutt-website', /* required */
    Key: key, /* required */
    ResponseContentEncoding: 'utf8',
    ResponseContentType: 'application/json',
    SSECustomerAlgorithm: 'AES256'
  };

  s3.getObject(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else data;         // successful response
  });
}

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
     console.log(event.httpMethod)
    switch (event.httpMethod) {
        case 'POST':
          // Load client
          getS3Obj('gssectret,json', function (data = null) {
            if (data) {
              authorize(data, createRequest, event);
            }
          });
          done(null, {success: "esto si funciona pero no lo sabes usar"});
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  getS3Obj('sheets.googleapis.com-nodejs.json', function (data = null) {
    if (data) {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client,event);
    }
  });
}

function createRequest(auth,event) {
  
  var resourceArray = [];
  
  var request = {
    auth: auth,
    spreadsheetId: '1bhXbigMkNyTgKFVePZIwP5VZE1hN0XcvTRdeFdUSUdo'
  };

  for (key in event) {
    resourceArray.push(event.key);
  }

  request.resource = [
    resourceArray
  ]

  addValues(requestJSON)
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
}
