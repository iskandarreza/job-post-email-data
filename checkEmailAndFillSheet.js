/**
 * Gets all the unread emails in a Gmail label or folder that were received in the last three days
 * and have "is hiring" in the subject line, finds all the links in the emails, and saves the links to
 * a Google Sheet.
 */
function checkEmailAndFillSheet() {
  var labelNames = ["Jobs/LinkedIn Job Alert", "Jobs/Indeed"];
  var date = new Date();
  date.setDate(date.getDate() - 3);
  var dateString = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy/MM/dd');

  var threads = [];

  for (var i = 0; i < labelNames.length; i++) {
    var label = labelNames[i];
    var labelThreads = GmailApp.search('label:' + label + ' after:' + dateString + ' is:unread', 0, 500);
    threads = threads.concat(labelThreads);
  }

  var links = getLinksFromThreads(threads);

  if (hasLinks(links)) {
    fillSheet(links);
  }
}


function hasLinks(links) {
  return Object.keys(links).length > 0
}

/**
 * It takes an object of key/url pairs, checks if the url is already in the sheet, and if not, adds it
 * @param links - This is the object that contains the key and url.
 */
function fillSheet(links) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName("Email Links")
  if (sheet == null) {
    sheet = ss.insertSheet("Email Links")
    sheet.appendRow(["Key", "URL"])
  }

  var existingData = sheet.getDataRange().getValues().slice(1)
  var existingUrls = existingData.map(function (row) {
    return row[1]
  })
  var existingKeys = existingData.map(function (row) {
    return row[0]
  })

  var rowsToAdd = []
  for (var key in links) {
    var url = links[key].url
    var key = links[key].key
    var companyName = links[url].companyName
    var role = links[url].role
    var location = links[url].location
    var posting = links[url].posting
    var originalUrl = 'https://www.indeed.com/rc/clk/dl?jk=' + key
    if (existingUrls.indexOf(url) == -1 && existingKeys.indexOf(key) == -1) {
      if (url.includes("indeed")) {
        rowsToAdd.push([key, url, companyName, role, location, posting, originalUrl])
      } else {
        rowsToAdd.push([key, url, companyName, role, location, '', ''])
      }

    }
  }
  if (rowsToAdd.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, 7).setValues(rowsToAdd)
  }
}


/**
 * Gets all the links in the messages of the given threads and returns them in an object.
 */
function getLinksFromThreads(threads) {
  var links = {}
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages()
    for (var j = 0; j < messages.length; j++) {
      var message = messages[j]
      var body = message.getBody()
      var $ = Cheerio.load(body)

      $('tbody').each(function () {
        var link = $(this).find('a').attr('href')

        if (link != null) {
          // Check if the link is from LinkedIn or Indeed.
          var linkWithoutQueryString = link.split('?')[0]
          var isLinkedIn = linkWithoutQueryString.includes('linkedin.com')
          var isIndeed = linkWithoutQueryString.includes('indeed.com/rc/clk/dl')

          if (isLinkedIn && linkWithoutQueryString.includes('/jobs/view')) {
            var key = linkWithoutQueryString.match(/\/(\d+)\/?$/)[1]
            if (!links.hasOwnProperty(linkWithoutQueryString)) {
              var entry = $(this).closest('table[role="presentation"]').first()
              var role = entry.find('a').first().text().trim()
              if (role) {
                var companyName = entry.find('p').eq(0).text().split('·')[0].trim()
                var role = entry.find('a').first().text().trim()
                var location = entry.find('p').eq(0).text().split('·')[1].trim()
                links[linkWithoutQueryString] = {
                  'url': linkWithoutQueryString,
                  'key': key,
                  'companyName': companyName,
                  'role': role,
                  'location': location
                }
              }
            }
            
          } else if (isIndeed) {
            var key = link.match(/jk=([^&]*)/i)
            if (key != null) {
              key = key[0].split("=")[1]
              var linkWithoutQueryString = "https://www.indeed.com/viewjob?jk=" + key

              if (!links.hasOwnProperty(linkWithoutQueryString)) {
                var companyName = $(this).find('tr').eq(1).find('span').eq(0).text().trim()
                var role = $(this).find('tr').eq(0).text().trim()
                var tr1 = $(this).find('tr').eq(1).text()
                var location = tr1.split('-')[1] ? tr1.split('-')[1].trim() : tr1.trim()
                var posting = $(this).find('tr').last().prev().text().trim()
                links[linkWithoutQueryString] = {
                  'url': linkWithoutQueryString,
                  'key': key,
                  'companyName': companyName,
                  'role': role,
                  'location': location,
                  'posting': posting
                }
              }
            }
          }
        }

      })

      message.markRead()
    }
  }

  return links
}

