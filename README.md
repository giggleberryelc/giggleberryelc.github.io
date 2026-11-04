# Giggleberry Early Learning Centre — website and waitlist

A static, mobile-friendly site deployable on free GitHub Pages, with a Google Sheets waitlist and Google Apps Script email notifications.

## Google Sheet

Row 1 must contain exactly these headings in columns A–G:

`Name | Child | DOB | Age | Email | Phone Number | Expected Start Date`

The public form asks for the six non-Age columns. The script inserts the Age formula itself; **you don't need to enter a formula in D2** if the spreadsheet is otherwise blank. If you already placed an `ARRAYFORMULA` in D2, **remove it first**, because the script writes an age formula for each submitted row.

## Connect the form to Google Sheets

1. Open your Google Sheet in your own Google account.
2. Select **Extensions → Apps Script**.
3. Ensure the existing deployed script matches the supplied `Code.gs` file. If it does not, replace the code and save, then deploy a new version.
4. If the waitlist tab is not the first tab, set `SHEET_NAME` to that tab's exact name.
5. Choose **Deploy → New deployment**, type **Web app**.
6. Set **Execute as: Me** and **Who has access: Anyone**. Authorize the script when Google asks. This lets the public form submit without exposing the sheet to the public.
7. The Web App has already been deployed and you provided its `/exec` URL. If you update the Google Apps Script source, use **Manage deployments → Edit → New version → Deploy** to activate the changes.
8. **Already completed:** `script.js` contains your supplied Web App `/exec` URL. No need to paste it again. If you create a new deployment with a different URL, update this value.
9. Test the form with a sample application. Confirm the row, calculated age, and notification email. Delete the sample row after the test.
10. If you edit `Code.gs` later, **Deploy → Manage deployments → Edit → New version → Deploy**, so the published Web App receives the update.

**Important:** The website sends a `no-cors` request because Apps Script web apps do not provide the cross-origin response headers needed to verify success from a static site. The browser cannot reliably confirm Google saved the request. Test on the live website. The success message intentionally says the request was *sent*, not confirmed as stored. For stronger delivery guarantees, a different backend would be required.

## Publish for free with GitHub Pages

1. Create a **public** GitHub repository, e.g. `giggleberry-elc` (GitHub Pages free hosting for standard GitHub accounts requires a public repo).
2. Upload `index.html`, `styles.css`, and `script.js` to the repository root. Do **not** upload your spreadsheet data or parent submissions.
3. Under **Settings → Pages**, choose **Deploy from a branch**, `main`, `/ (root)`, and Save.
4. Your site URL will be `https://giggleberryelc.github.io/`.
5. If editing after publication, commit changes to GitHub to publish the updated site.

### Security and privacy

- The Google Sheet should remain private; do not turn on public view/edit sharing.
- The `/exec` Web App URL must be public to accept submissions, so avoid collecting sensitive medical or family details using this simple form.
- Basic honeypot filtering is included, but this endpoint does not offer strong bot protection or abuse prevention. Apps Script and MailApp have quotas.
- Only authorized centre staff should access the Google Sheet. Establish a retention/deletion routine for waitlist records and handle privacy requests via the provided email.
- Review address, phone, hours, program descriptions, and privacy wording before publication.
