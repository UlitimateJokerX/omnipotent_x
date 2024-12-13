'use strict'

const md5 = require('md5')
const moment = require('moment')
const googlSheetApi = require('./database/google_sheet_api.js')
const tgLib = require('../lib/api/tg')

/**
 * 執行登入驗證
 *
 * @param Object userData 使用者帳密
 *
 * @returns {Object}
 */
async function login (userData) {
  const username = userData.username.toLowerCase()
  const password = md5(userData.password)
  const clientIp = userData.client_ip
  const data = await googlSheetApi.getData('user', {username}, false)
  const ret = {
    login_result_code: '1',
    login_result_msg: 'Verification succeeded',
    session_id: '',
    username: username
  }

  if (data.length === 0) {
    ret.login_result_code = '2'
    ret.login_result_msg = 'No such user'
  }

  if (data[0] && data[0].password !== password) {
    ret.login_result_code = '3'
    ret.login_result_msg = 'The password is incorrect'
  }

  if (data[0] && data[0].password === password) {
    ret.session_id = md5(Number(moment().format('YYYYMMDDHHmmss')) + Math.floor(Math.random() * 10000))
  }

  await googlSheetApi.addData('login_log', {
    username: username,
    created_at: moment().utcOffset('+08:00').format('YYYY-MM-DD HH:mm:ss'),
    ip: clientIp,
    login_result_code: ret.login_result_code,
    login_result_msg: ret.login_result_msg
  })

  if (ret.login_result_code == '1') {
    if (username !== 'kyrie') {
      await tgLib.sendMessage(`${username} Login!`)
    }
  } else {
    await tgLib.sendMessage(`${username} Login failed.(${ret.login_result_msg})`)
  }

  return ret
}

module.exports = {
  login
}
