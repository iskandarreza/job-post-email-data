For use in Google Apps Script
Script(s) to get job post links from specific label in Gmail, then send that data to a Google Sheet, then visit each link* so we can add data to the table rows for "Company", "Position", "Location", and the innerHTML of the DOM element on that page with the job description

* `checkEmailAndFillSheet()` gets the links from email
* `addLinkData()` adds the links to a specified Google Sheet
* `getLinkData()` fills the other data

\* Work in progress, might use a proper tool like playwright/puppeteer for this later so we can auth with the LinkedIn API instead of checking out the public page (which kinda doesn't include some very useful data like if it's remote position or not)

How to use:

1. Use this in the context of a Google Sheet by going to the **Extensions** menu and selecting **Apps Script**
![Create a sheetbook or open an existing one, then go to Extension -> Apps Script](https://lh6.googleusercontent.com/tocIcEM2yvaKZHw7iUrobf7dc5hLz1fAayzVrdPamKUnaSzTbzi0oecFYl10_G7wBao=w2400)

2. Copy over the file contents, then run the `start()` function 
![Put it all in one file or split it up like I did, your choice](https://lh5.googleusercontent.com/NdN4vTblRWUXivEOldZlixwDPCDQxpPR5VxhyIxGryAvNh5sHZP9_UxRF5r5rNWly3U=w2400)

3. authorize permissions**

\*\* Gonna need to figure out how to tighten this, by default it's way too permissive 
