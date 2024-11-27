'use strict'

const requestIp = require('request-ip')
const loginLib = require('../lib/login')

function Login (app) {
  /**
   * PUT /api/login
   *
   * 登入API
   */
  app.put('/api/login', async (req, res) => {
    try {
      const clientIp = requestIp.getClientIp(req)
      const ret = await loginLib.login(req.body, clientIp)

      return res.json({result: 'ok', ret})
    } catch (e) {
      return res.json({result: 'error', msg: e.message})
    }
  })
}

module.exports = Login
