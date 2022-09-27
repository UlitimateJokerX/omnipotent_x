'use strict'

const googlSheetApi = require('./database/google_sheet_api.js')

/**
 * 取得單一帳戶
 *
 * @returns {Object}
 */
async function getBanks () {
  const data = await googlSheetApi.getData('bank')

  return data
}

module.exports = {
  getBanks
}
