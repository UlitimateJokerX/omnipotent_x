'use strict'

const bankLib = require('../lib/banks')

function Banks (app) {
  /**
   * GET /api/banks
   *
   * 取得銀行列表API
   */
  app.get('/api/banks', async (req, res) => {
    try {
      const ret = await bankLib.getBanks()

      return res.json({result: 'ok', ret})
    } catch (e) {
      return res.json({result: 'error', msg: e.message})
    }
  })

  /**
   * GET /api/bank
   *
   * 取得單一銀行詳細資料API
   */
  app.get('/api/bank', async (req, res) => {
    const code = req.query.code

    try {
      const ret = await bankLib.getBank(code)
      ret.accounts = await bankLib.getBankAccount(code)

      return res.json({result: 'ok', ret})
    } catch (e) {
      return res.json({result: 'error', msg: e.message})
    }
  })

  /**
   * POST /api/bank
   *
   * 新增一筆銀行資料API
   */
  app.post('/api/bank', async (req, res) => {
    const newBank = req.body

    try {
      await bankLib.addBank(newBank)

      return res.json({result: 'ok'})
    } catch (e) {
      return res.json({result: 'error', msg: e.message})
    }
  })
}

module.exports = Banks
