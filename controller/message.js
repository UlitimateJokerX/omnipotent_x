'use strict'

const sortArray = require('sort-array')
const msgLib = require('../lib/message')

function Message (app) {
  /**
   * POST /api/message
   *
   * 新增訊息API
   */
  app.post('/api/message', async (req, res) => {
    try {
      const ret = await msgLib.add(req.body)

      return res.json({result: 'ok', ret})
    } catch (e) {
      return res.json({result: 'error', msg: e.message})
    }
  })

  /**
   * GET /api/message
   *
   * 取得訊息API
   */
  app.get('/api/message', async (req, res) => {
    try {
      const ret = await msgLib.get(req.body)

      const sortByIdDescRet = sortArray(ret, {
        by: 'id',
        order: 'desc'
      })

      return res.json({result: 'ok', ret: sortByIdDescRet})
    } catch (e) {
      return res.json({result: 'error', msg: e.message})
    }
  })
}

module.exports = Message
