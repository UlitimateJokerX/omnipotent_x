'use strict'

const { loadDoc } = require('./database/google_sheet_api.js');

/**
 * 取得所有帳戶
 *
 * @returns {Object}
 */
async function getAccounts () {
  const doc = await loadDoc()

  const sheet = doc.sheetsByTitle['bank_accounts']
  const rows = await sheet.getRows()

  const data = []

  for (let i in rows) {
    console.log(rows[i]._sheet.headerValues)
    data.push(rows[i]._rawData)
  }

  return data
}

module.exports = {
  getAccounts
}
