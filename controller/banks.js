'use strict'

const bankLib = require('../lib/banks')

function Banks (app) {
  /**
   * GET /api/banks
   *
   * 取得銀行API
   */
  app.get('/api/banks', async (req, res) => {
    try {
      const ret = await bankLib.getBanks()

      return res.json({result: 'ok', ret})
    } catch (e) {
      return res.json({result: 'error', msg: e.message})
    }
  })
}

module.exports = Banks
