# google-sheets-api
A little and simple probe for the use of Google Sheets API

## Installation
Clone the repository

    git clone https://github.com/aaroncadillac/google-sheets-api.git
Install dependencies

    npm install
    
For this test were used Google's officially supported Node.js client library for using Google APIs (**googleapis**) and the same client for using 0Auth 2.0 authorization (**google-auth-library**)

## Run the test

    node quick.js

## Content and spreadsheet support

You can customize your content to insert through the *request.json* file, the path of this file requires to be specified at runtime, you must also specify the id of the worksheet to be modified

    Enter a valid SpreadSheetID (You must have w/r permissions): HERE YOUR SPREADSHEET ID
    Enter path for JSON: ./app/request.json (For example)
    
  ### How to obtain Spreadsheet ID?
  
  Spreadsheete ID is included in the Google Sheets link, for example
  
  `https://docs.google.com/spreadsheets/d/`**1bhXbigMkNyTgKFVePZIwP5VZE1hN0XcvTRdeFdUSUdo**`/edit#gid=0`
    
The "request.json" format is declared in the Google API Documentation and is as follows

```js
{
  majorDimension: String,
  range: String
  values: [
    ["Some","Values","Separated","With","Comas"],
    [Another row],
    ...
  ]
}
```
In the example, the _majorDimension_ and _range_ fields are omitted since they are included in the addValues function

Note, the range assigned in the add Values function is "A1" since this range allows the new values to be added after the last row with data

The range assigned to "request.json" should not interfere with the one in the addValues function, or the API will return a range error, if you want to change the range, addValues must be corrected.

    

