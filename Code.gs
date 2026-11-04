/**
 * Giggleberry waitlist — Google Apps Script Web App.
 * Sheet columns A:G: Name | Child | DOB | Age | Email | Phone Number | Expected Start Date
 * Bind this script to the target spreadsheet via Extensions > Apps Script.
 */
const CONFIG = {
  SPREADSHEET_ID: '1qa5JO0F9RkOcWCagtYLrdqv5k80pfZwKQNoxvzz9IGo',
  SHEET_NAME: '', // Optional: enter the exact tab name. Blank uses the first tab.
  NOTIFY_EMAIL: 'giggleberryelc@gmail.com',
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Missing request');
    const data = JSON.parse(e.postData.contents);
    if (data.website) return text_('OK'); // spam honeypot

    const name = clean_(data.parentName, 120);
    const child = clean_(data.childName, 120);
    const email = clean_(data.email, 180);
    const phone = clean_(data.phone, 35);
    const dob = date_(data.dob);
    const start = date_(data.startDate);
    if (!name || !child || !phone || !email || !dob || !start || !data.consent) throw new Error('Required fields missing');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
    const today = new Date(); today.setHours(0,0,0,0);
    const maxDOB = new Date(today);
    maxDOB.setFullYear(maxDOB.getFullYear() + 5);

    if (dob > maxDOB) {
      throw new Error('Date of birth cannot be more than 5 years in the future');
    }
    if (dob.getFullYear() < today.getFullYear() - 18) throw new Error('Date of birth out of range');

    if (!lock.tryLock(10000)) throw new Error('Busy; retry submission');
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const sheet = CONFIG.SHEET_NAME ? ss.getSheetByName(CONFIG.SHEET_NAME) : ss.getSheets()[0];
      if (!sheet) throw new Error('Waitlist sheet not found');
      const expected = ['Name','Child','DOB','Age','Email','Phone Number','Expected Start Date'];
      const actual = sheet.getRange(1,1,1,7).getDisplayValues()[0];
      if (expected.some((h,i) => actual[i].trim() !== h)) throw new Error('Spreadsheet header mismatch. Check columns A:G.');

      const nextRow = Math.max(sheet.getLastRow() + 1, 2);
      // Neutralize formula injection in parent-entered string cells.
      sheet.getRange(nextRow,1,1,7).setValues([[
        safe_(name), safe_(child), dob,
        `=IF(C${nextRow}="","",IFERROR(DATEDIF(C${nextRow},TODAY(),"Y")&" years, "&DATEDIF(C${nextRow},TODAY(),"YM")&" months",""))`,
        safe_(email), safe_(phone), start
      ]]);
      sheet.getRange(nextRow,3).setNumberFormat('yyyy-mm-dd');
      sheet.getRange(nextRow,7).setNumberFormat('yyyy-mm-dd');
      SpreadsheetApp.flush();
      // An email failure should not undo an already-saved application.
      try {
        MailApp.sendEmail({
          to: CONFIG.NOTIFY_EMAIL,
          subject: 'New Giggleberry waitlist request — ' + child,
          body: 'New waitlist application received.\n\nParent: ' + name +
            '\nChild: ' + child + '\nDOB: ' + data.dob +
            '\nEmail: ' + email + '\nPhone: ' + phone +
            '\nExpected start date: ' + data.startDate +
            '\n\nView Google Sheet: https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID + '/edit'
        });
      } catch (mailError) { console.error('Notification failed: ' + mailError); }
    } finally { lock.releaseLock(); }
    return text_('OK');
  } catch (err) {
    console.error('Waitlist submission failed: ' + err);
    return text_('ERROR');
  }
}

function clean_(value, max) { return String(value || '').trim().slice(0, max); }
function safe_(value) { return /^[=+@\-\t\r]/.test(value) ? "'" + value : value; }
function date_(value) {
  const s = String(value || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y,m,d] = s.split('-').map(Number);
  const result = new Date(y,m-1,d);
  return result.getFullYear() === y && result.getMonth() === m-1 && result.getDate() === d ? result : null;
}
function text_(value) { return ContentService.createTextOutput(value).setMimeType(ContentService.MimeType.TEXT); }
