const { GoogleSpreadsheet } = require('google-spreadsheet')
const credentialsPath = '../../config/client_secret.json'

/**
 * @param  {String} docID the document ID
 * @param  {String} sheetTitle the google sheet table name
 */
async function getData(docID, sheetTitle) {
  const doc = new GoogleSpreadsheet(docID)
  const creds = require(credentialsPath)

  await doc.useServiceAccountAuth(creds)
  await doc.loadInfo()

  const sheet = doc.sheetsByTitle[sheetTitle]
  const rows = await sheet.getRows()

  const data = []

  for (let i in rows) {
    data.push(rows[i]._rawData)
  }

  return data
};

module.exports = {
  getData
}
