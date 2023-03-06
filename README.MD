For use in Google Apps Script
Script(s) to get job post links from specific label in Gmail, then send that data to a Google Sheet, then visit each link* so we can add data to the table rows for "Company", "Position", "Location", and the innerHTML of the DOM element on that page with the job description

1. `checkEmailAndFillSheet()` gets the links from email
2. `addLinkData()` adds the links to a specified Google Sheet
3. `getLinkData()` fills the other data

\* Work in progress, might use a proper tool like playwright/puppeteer for this later so we can auth with the LinkedIn API instead of checking out the public page (which kinda doesn't include some very useful data like if it's remote position or not)


Use this in the context of a Google Sheet by going to the **Extensions** menu and selecting **Apps Script**

Copy over the file contents, authorize permissions**

\*\* Gonna need to figure out how to tighten this, by default it's way too permissive 
