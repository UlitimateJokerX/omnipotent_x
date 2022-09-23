'use strict'

module.exports = Sports

const sportsLib = require('../lib/sports')

function Sports (app) {
  /**
   * GET /api/sports/prediction
   *
   * 取得賽事預測比例API
   */
  app.get('/api/sports/prediction', (req, res) => {
    const sport = req.query.sport

    return sportsLib.getPrediction(sport, (err, ret) => {
      if (err) {
        return res.json({result: 'error', msg: err.message})
      }

      return res.json({result: 'ok', ret: ret})
    })
  })

  /**
   * GET /api/sports/recommend
   *
   * 取得賽事推薦玩法API
   */
  app.get('/api/sports/recommend', async (req, res) => {
    const sport = req.query.sport
    const matchRecommends = req.query.matches

    return sportsLib.getPrediction(sport, (err, oriRet) => {
      if (err) {
        return res.json({result: 'error', msg: err.message})
      }

      return sportsLib.getRecommend(oriRet, matchRecommends, (err, finalRet) => {
        if (err) {
          return res.json({result: 'error', msg: err.message})
        }

        return res.json({result: 'ok', ret: finalRet})
      })
    })
  })
}
