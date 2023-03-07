/**
 * It loops through each row in the "Email Links" sheet, gets the URL in column B, and checks if the
 * URL exists in the link data object. If it does, it writes the data to the row.
 */
function addLinkData() {
  // Get the link data object.
  var linkData = getLinkData()
  
  // Get the "Email Links" sheet.
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName("Email Links")

  // Loop through each row in the sheet.
  var numRows = sheet.getDataRange().getNumRows()
  for (var i = 1; i <= numRows; i++) {
    var key = sheet.getRange(i, 1).getValue()
    var url = sheet.getRange(i, 2).getValue()

    // Check if the URL exists in the link data object.
    if (url in linkData) {
      var rowData = [
        key, 
        url, 
        sheet.getRange(i, 3).getValue(),
        sheet.getRange(i, 4).getValue(),
        sheet.getRange(i, 5).getValue(),
        linkData[url].posting,
        sheet.getRange(i, 7).getValue()
      ]

      sheet.getRange(i, 1, 1, 7).setValues([rowData])
    }
  }
}
