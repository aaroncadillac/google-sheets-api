const fs = require('fs'),
      readline = require('readline'),
      google = require('googleapis'),
      googleAuth = require('google-auth-library'),
      SCOPES = ['https://www.googleapis.com/auth/spreadsheets'],
      AWS = require('aws-sdk'),
      S3 = new AWS.S3();

function getS3Obj(key, callback){
  var paramsS3Object = {
    Bucket: 'coconutt-website',
    Key: key,
    ResponseContentEncoding: 'utf8',
    ResponseContentType: 'application/json'
  };
  S3.getObject(paramsS3Object, function(err, data) {
    if (err) {
      console.log('ERROR ===========>\n\n',err,'\n\n');
      console.log(err, err.stack); // an error occurred
    }
    else {
      callback(JSON.parse(data.Body.toString('utf-8')));
    } 
  });
}

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    switch (event.httpMethod) {
        case 'POST':
          // Load client
          getS3Obj('tokens/gssecret.json', function (data = null) {
            if (data) {
              authorize(data, createRequest, event.body);
            }
          });
          done(null, {success: "WebForm recived"})
        break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};

function authorize(credentials, callback, body) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  getS3Obj('tokens/sheets.googleapis.com-nodejs.json', function (data = null) {
    if (data) {
      oauth2Client.credentials = data;
      callback(oauth2Client, body);
    }
  });
}

function createRequest(auth, body) {
  
  var resourceArray = [];
  body = JSON.parse(body);

  var request = {
    auth: auth,
    spreadsheetId: '13kt5fmjtza2kPbx4vY7dhwPtrZlPPNKjs8ooEvwek8Q'
  };

  for (key in body) {
    resourceArray.push(body[key]);
  }

  request.resource = {
    values: [ resourceArray ]
  }

  addValues(request)
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

  console.log(sendObject)
  sheets.spreadsheets.values.append(sendObject, function(err, response){
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log(response);
  })
}
