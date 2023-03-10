/**
 * The function gets all the URLs from the "Email Links" sheet, then loops through each URL and gets
 * the company name, role, location, and posting from the page.
 * @returns An an array of objects with the following properties:
 * 
 * {
      companyName: companyName,
      position: position,
      location: location,
      posting: posting
    }
 *  
 */
function getLinkData() {
  // Get all the URLs from the "Email Links" sheet.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Email Links");
  var data = sheet.getDataRange().getValues();

  if (sheet == null) {
    sheet = ss.insertSheet("Email Links");
    sheet.appendRow(["Key, URL", "Company Name", "Role", "Location", "Posting"]);
  }

  // Check if the sheet has any rows.
  var numRows = sheet.getDataRange().getNumRows();
  if (numRows == 0) {
    sheet.appendRow(["Key, URL", "Company Name", "Role", "Location","Posting"]);
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

    const content = UrlFetchApp.fetch(url).getContentText()
    const $ = Cheerio.load(content);

    var companyName = $('[data-tracking-control-name="public_jobs_topcard-org-name"]').first().text().trim();
    var position = $('h1').first().text().trim(); 
    var location = $('.topcard__flavor').eq(1).text().trim()
    var posting = $('.show-more-less-html__markup').first().html()
    
    // Add the link data to the link data object.
    linkData[url] = {
      companyName: companyName,
      position: position,
      location: location,
      //jobType: jobType,
      posting: posting
    };

  }

  return linkData

}
