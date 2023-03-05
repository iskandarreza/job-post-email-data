function checkEmailAndFillSheet() {
  // Define the name of the Gmail label or folder where the emails are located.
  var labelName = "Jobs/LinkedIn Job Alert";

  // Get the date three days ago.
  var date = new Date();
  date.setDate(date.getDate() - 3);
  var dateString = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy/MM/dd');

  // Get all the threads in the Gmail label or folder that were received in the last three days and are unread.
  var threads = GmailApp.search('label:' + labelName + ' after:' + dateString + ' is:unread', 0, 500);

  // Create an empty array to store the links.
  var links = {};

  // Loop through each thread.
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    // Loop through each message in the thread.
    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      var body = message.getBody();
      // Find all the links in the message body using a regular expression.
      var linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i;

      var matches = body.match(new RegExp(linkRegex.source, "gi"));
      // If there are any links, add them to the links object.
      if (matches != null) {
        for (var k = 0; k < matches.length; k++) {
          var link = matches[k].replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i, '$2');
          // Remove query strings after the ? character
          var linkWithoutQueryString = link.split('?')[0];
          if (linkWithoutQueryString.includes("/jobs/view")) {
            // Extract the numbers at the end of the link
            var key = linkWithoutQueryString.match(/\/(\d+)\/?$/)[1];
            // Check if the link already exists in the links object
            if (!links.hasOwnProperty(linkWithoutQueryString)) {
              // Add the link to the links object
              links[linkWithoutQueryString] = { 'url': linkWithoutQueryString, 'key': key };
            }
          }
        }
      }
      // Mark the message as read.
      message.markRead();
    }
  }

  // If there are any links, save them to the Google Sheet.
  if (Object.keys(links).length > 0) {
    // Open the "Email Links" sheet.
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Email Links");
    if (sheet == null) {
      sheet = ss.insertSheet("Email Links");
      sheet.appendRow(["Key", "URL"]);
    }
    // Get the existing URLs in the sheet.
    var existingUrls = sheet.getDataRange().getValues().slice(1).map(function (row) {
      return row[1];
    });
    // Add the new links to the sheet.
    var rowsToAdd = [];
    for (var key in links) {
      var url = links[key].url;
      if (existingUrls.indexOf(url) == -1) {
        rowsToAdd.push([links[key].key, url]);
      }
    }
    if (rowsToAdd.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, 2).setValues(rowsToAdd);
    }
  }
}