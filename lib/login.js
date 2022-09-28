'use strict'

const md5 = require('md5')
const moment = require('moment')
const googlSheetApi = require('./database/google_sheet_api.js')

/**
 * 執行登入驗證
 *
 * @param Object userData 使用者帳密
 *
 * @returns {Object}
 */
async function login (userData) {
  const username = userData.username
  const password = md5(userData.password)
  const data = await googlSheetApi.getData('user', {username}, false)
  let loginResultCode = '1'
  let loginResultMsg = 'Verification succeeded'
  let sessionId = ''

  if (data.length === 0) {
    loginResultCode = '2'
    loginResultMsg = 'No such user'
  }

  if (data[0] && data[0].password !== password) {
    loginResultCode = '3'
    loginResultMsg = 'The password is incorrect'
  }

  if (data[0] && data[0].password === password) {
    sessionId = md5(Number(moment().format('YYYYMMDDHHmmss')) + Math.floor(Math.random() * 10000))
  }

  return {
    login_result_code: loginResultCode,
    login_result_msg: loginResultMsg,
    session_id: sessionId
  }
}

module.exports = {
  login
}
