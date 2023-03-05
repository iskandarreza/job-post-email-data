function getLinkData() {
  // Get all the URLs from the "Email Links" sheet.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Email Links");
  var data = sheet.getDataRange().getValues();

  if (sheet == null) {
    sheet = ss.insertSheet("Email Links");
    sheet.appendRow(["Key, URL", "Company Name", "Role", "Location", "Type"]);
  }

  // Check if the sheet has any rows.
  var numRows = sheet.getDataRange().getNumRows();
  if (numRows == 0) {
    sheet.appendRow(["Key, URL", "Company Name", "Role", "Location","Type"]);
  }

  // Create an empty object to store the link data.
  var linkData = {};

  // Loop through each row in the sheet.
  for (var i = 1; i < data.length; i++) {
    var url = data[i][1];

    // Check if the link already exists in the link data object. If it does, skip it.
    if (url in linkData) {
      continue;
    }

    // Navigate to the link.
    var response = null;
    var retries = 0;
    while (retries < 5) {
      try {
        response = UrlFetchApp.fetch(url, {
          muteHttpExceptions: true,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "accept-language": "en-US,en;q=0.9"
          }
        });
        if (response.getResponseCode() == 429 || response.getResponseCode() == 999) {
          // Throttle the requests.
          Logger.log("Throttled...", response.getContentText)
          Utilities.sleep(1000 * 60 * 5);
          retries++;
        } else {
          // Break out of the loop if the request was successful.
          break;
        }
      } catch (e) {
        Logger.log("Error fetching URL: " + url);
        Logger.log(e);
        // Throttle the requests.
        Utilities.sleep(1000 * 60 * 5);
        retries++;
      }
    }

    // If there is an error retrieving the page title, that means the link has expired. Remove it from the list.
    if (response == null || response.getResponseCode() != 200) {
      continue;
    }

    var titleRegex = /<title>(.*?)<\/title>/i;
    var titleMatches = response.getContentText().match(titleRegex);
    var title = titleMatches != null ? titleMatches[1] : "";

    // Get the company name, position/role, and location from the page title using regular expressions.
    var companyRegex = /^(.*?)\s*hiring/i;
    var positionRegex = /hiring\s+(.*?)\s+in\s+/i;
    var locationRegex = /,\s+(.*?)\s*\|\s+LinkedIn$/i;

    var companyMatches = title.match(companyRegex);
    var positionMatches = title.match(positionRegex);
    var locationMatches = title.match(locationRegex);

    var companyName = companyMatches != null ? companyMatches[1] : "";
    var position = positionMatches != null ? positionMatches[1] : "";
    var location = locationMatches != null ? locationMatches[1] : "";

    var jobTypeRegex = /<span class="jobs-unified-top-card__workplace-type">(.+?)<\/span>/i;
    var jobTypeMatches = response.getContentText().match(jobTypeRegex);
    var jobType = jobTypeMatches != null ? jobTypeMatches[1] : "";

    // Logger.log(response.getContentText())

    // Add the link data to the link data object.
    linkData[url] = {
      companyName: companyName,
      position: position,
      location: location,
      jobType: jobType
    };

    Logger.log(linkData[url])
  }

  return linkData

}
