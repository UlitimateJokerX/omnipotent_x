'use strict'

module.exports = jp

const Jp = require('../lib/jp')

function jp (app) {
  /**
   * GET /jp_gojuon
   *
   * 五十音表頁面
   */
  app.get('/jp_gojuon', (req, res) => {
    res.render('pages/jp-gojuon.ejs')
  })

  /**
   * GET /api/jp_gojuon
   *
   * 取得五十音表
   */
  app.get('/api/jp_gojuon', async (req, res) => {
    const list = await Jp.getGojuonList()

    res.json({result: 'ok', ret: list})
  })
}