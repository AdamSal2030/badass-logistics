/**
 * Badass Logistics — Credit Application PDF relay
 * Receives the credit application (fields + a base64 PDF) from
 * credit-application.html and emails it to accounts@badasslogistics.com
 * with the completed PDF attached.
 *
 * Deploy: Deploy ▸ New deployment ▸ Web app
 *   - Execute as: Me (sam@badasslogistics.com)
 *   - Who has access: Anyone
 * Then paste the Web app URL into RELAY_URL in credit-application.html.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var to = 'accounts@badasslogistics.com';
    var company = data['Legal Company Name'] || 'Unknown Company';
    var subject = 'New Credit Application — ' + company;

    var skip = { pdfBase64: 1, pdfFilename: 1 };
    var lines = [];
    Object.keys(data).forEach(function (k) {
      if (skip[k]) return;
      lines.push(k + ': ' + data[k]);
    });
    var body = 'A new credit application was submitted via badasslogistics.com.\n\n'
             + lines.join('\n')
             + '\n\nThe completed application is attached as a PDF.';

    var options = { name: 'Badass Logistics Credit App' };
    if (data.pdfBase64) {
      var bytes = Utilities.base64Decode(data.pdfBase64);
      var blob = Utilities.newBlob(bytes, 'application/pdf', data.pdfFilename || 'Credit-Application.pdf');
      options.attachments = [blob];
    }
    MailApp.sendEmail(to, subject, body, options);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('Badass Logistics credit-app relay is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}
