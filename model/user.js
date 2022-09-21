'use strict'

const sql = require('./index')
const moment = require('moment')

function User (user) {
  this.username = user.username
  this.password = user.password
  this.alias = user.alias
  this.created_at = moment().format('YYYY-MM-DD HH:mm:ss')
}

User.create = (newUser, cb) => {
  sql.query('INSERT INTO user set ?', newUser, (err, res) => {
    if (err) {
      return cb(err, null)
    }

    return cb(null, res)
  })
}

User.findAll = cb => {
  sql.query('SELECT * FROM user', (err, res) => {
    if (err) {
      return cb(err, null)
    }

    if (!res) {
      return cb(null, [])
    }

    res = JSON.parse(JSON.stringify(res))

    for (let i in res) {
      res[i].created_at = moment(res[i].created_at).format('YYYY-MM-DD HH:mm:ss')
    }

    return cb(null, res)
  })
}

User.findById = (userId, cb) => {
  sql.query('SELECT * FROM user WHERE id = ?', userId, (err, res) => {
    if (err) {
      return cb(err, null)
    }

    if (!res) {
      return cb(null, {})
    }

    res = JSON.parse(JSON.stringify(res))[0]
    res.created_at = moment(res.created_at).format('YYYY-MM-DD HH:mm:ss')

    return cb(null, res)
  })
}

module.exports = User