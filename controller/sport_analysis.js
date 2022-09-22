'use strict'

module.exports = SportAnalysis

const sportAnalysisLib = require('../lib/sport_analysis')

function SportAnalysis (app) {
  /**
   * GET /api/sport_analysis/playsport_prediction
   *
   * 玩運彩賽事分析
   */
  app.get('/api/sport_analysis/playsport_prediction', (req, res) => {
    const sport = req.query.sport

    return sportAnalysisLib.getPlaysportPrediction(sport, (err, ret) => {
      if (err) {
        return res.json({result: 'error', msg: err.message})
      }

      return res.json({result: 'ok', ret: ret})
    })
  })

  /**
   * GET /api/sport_analysis/recommend
   *
   * 賽事與玩法推薦
   */
  app.get('/api/sport_analysis/recommend', async (req, res) => {
    const sport = req.query.sport
    const matchRecommends = req.query.matches

    return sportAnalysisLib.getPlaysportPrediction(sport, (err, oriRet) => {
      if (err) {
        return res.json({result: 'error', msg: err.message})
      }

      return sportAnalysisLib.getRecommend(oriRet, matchRecommends, (err, finalRet) => {
        if (err) {
          return res.json({result: 'error', msg: err.message})
        }

        return res.json({result: 'ok', ret: finalRet})
      })
    })
  })
}
