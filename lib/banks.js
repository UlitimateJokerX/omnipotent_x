'use strict'

const googleSheetApi = require('./database/google_sheet_api.js')
const _ = require('lodash')

/**
 * 取得所有銀行
 *
 * @returns {Object}
 */
async function getBanks () {
  let data = await googleSheetApi.getData('bank')

  data = _.sortBy(data, ['code'])

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
  const data = await googleSheetApi.getData('bank', {code})

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
  const data = await googleSheetApi.getData('bank_account', {code})

  return data
}

/**
 * 新增銀行
 *
 * @param {Object} newBank
 * {
 *   code: '001', // 銀行代碼
 *   bank_name: 'XX銀行' // 銀行名稱
 * }
 *
 * @returns {Object}
 */
async function addBank (newBank) {
  await googleSheetApi.addData('bank', newBank, 'code')

  return
}

module.exports = {
  getBanks,
  getBank,
  getBankAccount,
  addBank
}
