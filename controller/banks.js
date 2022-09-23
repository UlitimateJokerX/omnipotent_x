'use strict'

module.exports = Banks

const bankLib = require('../lib/banks')

function Banks (app) {
  /**
   * GET /api/banks/accounts
   *
   * 取得帳戶API
   */
  app.get('/api/banks/accounts', (req, res) => {
    return res.json({
      result: 'ok',
      ret: [
        {id: 1, name: 'fubon'},
        {id: 2, name: 'dawho'}
      ]
    })
  })
}
