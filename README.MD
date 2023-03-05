For use in Google Apps Script
Script(s) to get job post links from specific label in Gmail, then send that data to a Google Sheet, then visit each link to get the page title (so we can add "Company", "Position", and "Location" data to the table rows)*

1. `checkEmailAndFillSheet()` gets the links from email
2. `addLinkData()` adds the links to a specified Google Sheet
3. `getLinkData()` fills the other data

\* Work in progress, might use a proper tool like playwright for this later

Use this in the context of a Google Sheet by going to the **Extensions** menu and selecting **Apps Script**
Copy over the file contents, authorize permissions**

\*\* Gonna need to figure out how to tighten this, by default it's way too permissive 