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
  const ret = {
    login_result_code: '1',
    login_result_msg: 'Verification succeeded',
    session_id: ''
  }

  if (data.length === 0) {
    ret.login_result_code = '2'
    ret.login_result_msg = 'No such user'

    return ret
  }

  if (data[0]?.password !== password) {
    ret.login_result_code = '3'
    ret.login_result_msg = 'The password is incorrect'

    return ret
  }

  if (data[0]?.password === password) {
    ret.session_id = md5(Number(moment().format('YYYYMMDDHHmmss')) + Math.floor(Math.random() * 10000))

    return ret
  }
}

module.exports = {
  login
}
