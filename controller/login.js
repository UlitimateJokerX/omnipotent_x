'use strict'

const loginLib = require('../lib/login')

function Login (app) {
  /**
   * PUT /api/login
   *
   * 登入API
   */
  app.put('/api/login', async (req, res) => {
    try {
      const ret = await loginLib.login(req.body)

      console.log(ret)

      return res.json({result: 'ok', ret})
    } catch (e) {
      return res.json({result: 'error', msg: e.message})
    }
  })
}

module.exports = Login
