'use strict'

const moment = require('moment')
const googlSheetApi = require('./database/google_sheet_api.js')
const tgLib = require('../lib/api/tg')

/**
 * 新增訊息
 *
 * @param Object data 訊息內容
 *
 * @returns {Object}
 */
async function add (data) {
  const operator = data.operator.toLowerCase()
  const message = data.message
  const maxId = await googlSheetApi.getData('message', {}, false, true)
  const newId = Number(maxId) + 1

  const msgData = {
    id: newId,
    content: message,
    img: '',
    operator: operator,
    created_at: moment().utcOffset('+08:00').format('YYYY-MM-DD HH:mm:ss'),
    modified_at: moment().utcOffset('+08:00').format('YYYY-MM-DD HH:mm:ss'),
    deleted: 0
  }

  await googlSheetApi.addData('message', msgData, 'id')

  if (operator !== 'kyrie') {
    await tgLib.sendMessage(`${operator} add new message!`)
  }
}

/**
 * 取得訊息
 *
 * @returns {Object}
 */
async function get () {
  const result = await googlSheetApi.getData('message', {})

  return result
}

/**
 * 修改訊息
 *
 * @param Integer msgId 訊息編號
 * @param Object  newData 修改欄位與數值
 *
 * @returns {Object}
 */
async function update (msgId, newData) {
  await googlSheetApi.updateData('message', {id: msgId}, newData)
}

module.exports = {
  add,
  get,
  update
}
