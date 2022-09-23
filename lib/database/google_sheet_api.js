const { GoogleSpreadsheet } = require('google-spreadsheet')
const config = require('../../config/config')
const credentials = require('../../config/client_secret.json')

// 初始化google sheet
async function loadDoc() {
  const doc = new GoogleSpreadsheet(config.doc_id)

  await doc.useServiceAccountAuth(credentials)
  await doc.loadInfo()

  return doc
}

module.exports = {
  loadDoc
}
