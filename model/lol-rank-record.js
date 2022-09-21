'use strict'

const sql = require('./index')
const moment = require('moment')

function LolRankRecord (record) {
  this.play_with= record.play_with
  this.role = record.role
  this.result = record.result
  this.rank = record.rank
  this.play_at = moment().format('YYYY-MM-DD 00:00:00')
}

LolRankRecord.create = (newRecord, cb) => {
  sql.query('INSERT INTO lol_rank_record set ?', newRecord, (err, res) => {
    if (err) {
      return cb(err, null)
    }

    return cb(null, res)
  })
}

LolRankRecord.findAll = cb => {
  sql.query('SELECT * FROM lol_rank_record', (err, res) => {
    if (err) {
      return cb(err, null)
    }

    if (!res) {
      return cb(null, [])
    }

    res = JSON.parse(JSON.stringify(res))

    for (let i in res) {
      res[i].play_at = moment(res[i].play_at).format('YYYY-MM-DD')
    }

    return cb(null, res)
  })
}

module.exports = LolRankRecord