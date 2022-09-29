'use strict'

const googlSheetApi = require('./database/google_sheet_api.js')

/**
 * 取得所有銀行
 *
 * @returns {Object}
 */
async function getBanks () {
  const data = await googlSheetApi.getData('bank')

  return data
}

/**
 * 取得單一銀行資料
 *
 * @param {String} code // 銀行代碼
 *
 * @returns {Object}
 */
async function getBank (code) {
  const data = await googlSheetApi.getData('bank', {code})

  if (data.length === 0) {
    throw new Error('No such bank')
  }

  return data[0]
}

/**
 * 取得銀行帳戶資料
 *
 * @param {String} code // 銀行代碼
 *
 * @returns {Object}
 */
async function getBankAccount (code) {
  const data = await googlSheetApi.getData('bank_account', {code})

  return data
}

module.exports = {
  getBanks,
  getBank,
  getBankAccount
}
