'use strict'

const sportsLib = require('../lib/sports')

function Sports (app) {
  /**
   * GET /api/sports/prediction
   *
   * 取得賽事預測比例API
   */
  app.get('/api/sports/prediction', async (req, res) => {
    const sport = req.query.sport

    try {
      const ret = await sportsLib.getPrediction(sport)

      return res.json({result: 'ok', ret})
    } catch (e) {
      return res.json({result: 'error', msg: e.message})
    }
  })

  /**
   * GET /api/sports/recommend
   *
   * 取得賽事推薦玩法API
   */
  app.get('/api/sports/recommend', async (req, res) => {
    const sport = req.query.sport
    const matchRecommends = req.query.matches

    try {
      const prediction = await sportsLib.getPrediction(sport)
      const ret = await sportsLib.getRecommend(prediction, matchRecommends)

      return res.json({result: 'ok', ret})
    } catch (e) {
      return res.json({result: 'error', msg: e.message})
    }
  })
}

module.exports = Sports
