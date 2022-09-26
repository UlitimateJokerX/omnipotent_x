'use strict'

const { loadDoc } = require('./database/google_sheet_api.js');

/**
 * 取得所有帳戶
 *
 * @returns {Object}
 */
async function getBanks () {
  const doc = await loadDoc()

  const sheet = doc.sheetsByTitle['bank']
  const rows = await sheet.getRows()

  const data = []

  for (let i in rows) {
    data.push(
      {
        code: rows[i]._rawData[0],
        name: rows[i]._rawData[1],
      }
    )
  }

  return data
}

module.exports = {
  getBanks
}
