'use strict'

const request = require('request')
const moment = require('moment')

/**
 * 取得玩運彩預測比例
 *
 * @param String sport
 *
 * @returns {Object}
 */
exports.getPlaysportPrediction = (sport, cb) => {
  const playsportUrl = 'https://www.playsport.cc/predictgame.php?action=scale&'
  // 球種代號
  const allianceidMap = {
    'MLB': 1,
    'NPB': 2,
    'NBA': 3,
    'CPBL': 6,
    'KBO': 9,
    'P+': 16,
    'SBL': 89,
    'NHL': 91,
    'KBL': 92,
    'CAB': 94,
    'BJL': 97,
  }

  // 推薦分類代號
  const sidArray = [1, 3]

  const sportKind = allianceidMap[sport.toUpperCase()]
  const date = moment().format('YYYYMMDD')

  return getInfo()

  function getInfo () {
    const url = `${playsportUrl}allianceid=${sportKind}&gametime=${date}&sid=${sidArray[0]}`

    request(url, (err, response, body) => {
      if (err) {
        return cb(err)
      }

      const allHtml = body.split('target="_blank"')
      const neededHtml = []

      for (let i in allHtml) {
        if (i == 0) {
          continue
        }

        neededHtml.push(allHtml[i])
      }

      return processTeams(neededHtml)
    })
  }

  function processTeams (body) {
    let allMatch = []
    let matchId = 0
    let match = ''
    let awayWin = 0
    let homeWin = 0
    let handicapWeak = 0
    let handicapStrong = 0
    let totalBig = 0
    let totalSmall = 0

    for (let i in body) {
      const teamName = body[i].split('</a')[0].split('>')[1].trim()
      let countStartIndex = 0

      if (body[i].split(' 人預測').length < 4) {
        continue
      }

      if (body[i].split(' 人預測').length > 4) {
        countStartIndex = 2
      }

      if (body[i].includes('strong>+')) {
        handicapWeak = body[i].split(' 人預測')[countStartIndex].split('hide">')[1]
      } else if (body[i].includes('strong>-')) {
        handicapStrong = body[i].split(' 人預測')[countStartIndex].split('hide">')[1]
      }

      if (i % 2 == 0) {
        matchId = matchId + 1
        match = teamName

        awayWin = body[i].split(' 人預測')[countStartIndex + 1].split('hide">')[1]
        totalBig = body[i].split(' 人預測')[countStartIndex + 2].split('hide">')[1]
      }

      if (i % 2 != 0) {
        match = match + ' @ ' + teamName
        homeWin = body[i].split(' 人預測')[countStartIndex + 1].split('hide">')[1]
        totalSmall = body[i].split(' 人預測')[countStartIndex + 2].split('hide">')[1]

        allMatch.push({
          match_id: matchId,
          match: match,
          away_win: awayWin,
          home_win: homeWin,
          handicap_weak: handicapWeak,
          handicap_strong: handicapStrong,
          total_big: totalBig,
          total_small: totalSmall
        })
      }
    }

    return processTop100Url(allMatch)
  }

  function processTop100Url(matches) {
    const url2 = `${playsportUrl}allianceid=${sportKind}&gametime=${date}&sid=${sidArray[1]}`

    request(url2, (err, response, body) => {
      if (err) {
        return cb(err)
      }

      const allHtml = body.split('target="_blank"')
      const neededHtml = []

      for (let i in allHtml) {
        if (i == 0) {
          continue
        }

        neededHtml.push(allHtml[i])
      }

      return processTop100(neededHtml, matches)
    })
  }

  function processTop100 (body, matches) {
    let awayWin = 0
    let homeWin = 0
    let handicapWeak = 0
    let handicapStrong = 0
    let totalBig = 0
    let totalSmall = 0

    for (let i in body) {
      const teamName = body[i].split('</a')[0].split('>')[1].trim()
      let countStartIndex = 0

      if (body[i].split(' 人預測').length > 4) {
        countStartIndex = 2
      }

      for (let m in matches) {
        if (matches[m].match.includes(teamName)) {
          if (i % 2 == 0) {
            awayWin = body[i].split(' 人預測')[countStartIndex + 1].split('hide">')[1]
            totalBig = body[i].split(' 人預測')[countStartIndex + 2].split('hide">')[1]
          }

          if (i % 2 != 0) {
            homeWin = body[i].split(' 人預測')[countStartIndex + 1].split('hide">')[1]
            totalSmall = body[i].split(' 人預測')[countStartIndex + 2].split('hide">')[1]
          }

          if (body[i].includes('strong>+')) {
            handicapWeak = body[i].split(' 人預測')[countStartIndex].split('hide">')[1]
          } else if (body[i].includes('strong>-')) {
            handicapStrong = body[i].split(' 人預測')[countStartIndex].split('hide">')[1]
          }

          if (i % 2 != 0) {
            matches[m].away_win = Number(matches[m].away_win) + Number(awayWin)
            matches[m].home_win = Number(matches[m].home_win) + Number(homeWin)
            matches[m].handicap_weak = Number(matches[m].handicap_weak) + Number(handicapWeak)
            matches[m].handicap_strong = Number(matches[m].handicap_strong) + Number(handicapStrong)
            matches[m].total_big = Number(matches[m].total_big) + Number(totalBig)
            matches[m].total_small = Number(matches[m].total_small) + Number(totalSmall)
          }
        }
      }
    }

    return cb(null, matches)
  }
}