'use strict'

const User = require('../model/user')

module.exports = user

function user (app) {
  /**
   * GET /api/user/:id
   *
   * 取得單一使用者API
   */
  app.get('/api/user/:id([0-9]+)', (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (err) {
        return res.json({result: 'error', msg: err.message})
      }

      return res.json({result: 'ok', ret: user})
    })
  })

  /**
   * GET /api/user/all
   *
   * 取得全部使用者API
   */
  app.get('/api/user/all', (req, res) => {
    User.findAll((err, user) => {
      if (err) {
        return res.json({result: 'error', msg: err.message})
      }

      return res.json({result: 'ok', ret: user})
    })
  })

  /**
   * POST /api/user/create
   *
   * 新增使用者API
   */
  app.post('/api/user/create', (req, res) => {
    const newUser = new User(req.body)

    if (!newUser.username || !newUser.password || !newUser.alias) {
      return res.json({result: 'error', msg: '缺少必要參數'})
    }

    User.create(newUser, (err, user) => {
      if (err) {
        return res.json({result: 'error', msg: err.message})
      }

      return res.json({result: 'ok'})
    })
  })
}