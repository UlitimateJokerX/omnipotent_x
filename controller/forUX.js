'use strict'

module.exports = forUX

function forUX (app) {
  /**
   * GET /api/test
   *
   * 五十音表頁面
   */
  app.get('/api/test', (req, res) => {
    console.log('aaa')
    res.json({result: 'ok', ret: '測試成功'})
  })
}