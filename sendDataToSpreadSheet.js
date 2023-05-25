const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require("fs");

async function sendDataToSpreadSheet(rows, index) {
  const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

  const CREDENTIALS = JSON.parse(fs.readFileSync("api-project.json"));

  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[index];
  for (let i = 0; i < rows.length; i++) {
    await sheet.addRow(rows[i]);
  }
}

module.exports = { sendDataToSpreadSheet };
