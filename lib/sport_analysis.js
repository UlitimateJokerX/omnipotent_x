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
    let strongTeam = 'home'

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

      // 客隊的行數
      if (i % 2 == 0) {
        matchId = matchId + 1
        match = teamName

        awayWin = body[i].split(' 人預測')[countStartIndex + 1].split('hide">')[1]
        totalBig = body[i].split(' 人預測')[countStartIndex + 2].split('hide">')[1]

        // 客隊出現-x.5代表強隊為客隊
        if (body[i].search(/-\d+\.5/) != -1) {
          strongTeam = 'away'
        } else {
          strongTeam = 'home'
        }
      }

      // 主隊的行數
      if (i % 2 != 0 && matchId != 0) {
        match = match + ' @ ' + teamName
        homeWin = body[i].split(' 人預測')[countStartIndex + 1].split('hide">')[1]
        totalSmall = body[i].split(' 人預測')[countStartIndex + 2].split('hide">')[1]

        allMatch.push({
          match_id: matchId,
          match: match,
          strong_team: strongTeam,
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

/**
 * 取得玩運彩預測比例
 *
 * @param Object oriRet
 * @param Array matches
 *
 * @returns {Object}
 */
exports.getRecommend = (oriRet, recommendMatches, cb) => {
  const recommendList = []

  for (let i in oriRet) {
    // 1. 取出客隊、主隊隊名、強弱隊
    const teamAway = oriRet[i].match.split(' @ ')[0]
    const teamHome = oriRet[i].match.split(' @ ')[1]
    const strongTeam = oriRet[i].strong_team == 'away' ? teamAway : teamHome
    const weakTeam = oriRet[i].strong_team == 'away' ? teamHome : teamAway

    // 2. 計算獨贏
    const awayWinNum = Number(oriRet[i].away_win)
    let awayScore = 0
    const homeWinNum = Number(oriRet[i].home_win)
    let homeScore = 0

    const awayWinRate = awayWinNum / (awayWinNum + homeWinNum)

    if (awayWinRate <= 0.2) {
      awayScore = 1
      homeScore = 6
    }

    if (0.2 < awayWinRate && awayWinRate <= 0.35) {
      awayScore = 2
      homeScore = 5
    }

    if (0.35 < awayWinRate && awayWinRate <= 0.5) {
      awayScore = 3
      homeScore = 4
    }

    if (0.5 < awayWinRate && awayWinRate <= 0.65) {
      awayScore = 4
      homeScore = 3
    }

    if (0.65 < awayWinRate && awayWinRate <= 0.8) {
      awayScore = 5
      homeScore = 2
    }

    if (0.8 < awayWinRate) {
      awayScore = 6
      homeScore = 1
    }

    // 3. 計算讓分
    const strongWinNum = Number(oriRet[i].handicap_strong)
    let strongScore = 0
    const weakWinNum = Number(oriRet[i].handicap_weak)
    let weakScore = 0

    const strongWinRate = strongWinNum / (strongWinNum + weakWinNum)

    if (strongWinRate <= 0.2) {
      strongScore = 1
      weakScore = 6
    }

    if (0.2 < strongWinRate && strongWinRate <= 0.35) {
      strongScore = 2
      weakScore = 5
    }

    if (0.35 < strongWinRate && strongWinRate <= 0.5) {
      strongScore = 3
      weakScore = 4
    }

    if (0.5 < strongWinRate && strongWinRate <= 0.65) {
      strongScore = 4
      weakScore = 3
    }

    if (0.65 < strongWinRate && strongWinRate <= 0.8) {
      strongScore = 5
      weakScore = 2
    }

    if (0.8 < strongWinRate) {
      strongScore = 6
      weakScore = 1
    }

    // 4. 計算大小分
    const bigWinNum = Number(oriRet[i].total_big)
    let bigScore = 0
    const smallWinNum = Number(oriRet[i].total_small)
    let smallScore = 0

    const bigWinRate = bigWinNum / (bigWinNum + smallWinNum)

    if (bigWinRate <= 0.2) {
      bigScore = 1
      smallScore = 6
    }

    if (0.2 < bigWinRate && bigWinRate <= 0.35) {
      bigScore = 2
      smallScore = 5
    }

    if (0.35 < bigWinRate && bigWinRate <= 0.5) {
      bigScore = 3
      smallScore = 4
    }

    if (0.5 < bigWinRate && bigWinRate <= 0.65) {
      bigScore = 4
      smallScore = 3
    }

    if (0.65 < bigWinRate && bigWinRate <= 0.8) {
      bigScore = 5
      smallScore = 2
    }

    if (0.8 < bigWinRate) {
      bigScore = 6
      smallScore = 1
    }

    // 5. 取出推薦清單有加乘的項目
    for (let j in recommendMatches) {
      if (Number(oriRet[i].match_id) == Number(recommendMatches[j].match_id)) {
        if (recommendMatches[j].playtype == 'away_win') {
          awayScore = awayScore + 3
        }

        if (recommendMatches[j].playtype == 'home_win') {
          homeScore = homeScore + 3
        }

        if (recommendMatches[j].playtype == 'handicap_strong') {
          strongScore = strongScore + 3
        }

        if (recommendMatches[j].playtype == 'handicap_weak') {
          weakScore = weakScore + 3
        }

        if (recommendMatches[j].playtype == 'total_big') {
          bigScore = bigScore + 3
        }

        if (recommendMatches[j].playtype == 'total_small') {
          smallScore = smallScore + 3
        }
      }
    }

    // 6. 總計算
    // 6-1. 獨贏盤
    if (awayScore != homeScore) {
      if (Math.abs(awayScore - homeScore) >= 5) {
        recommendList.push({
          playtype: `${awayScore > homeScore ? teamAway : teamHome}PK`,
          star: 3
        })
      }

      if (3 <= Math.abs(awayScore - homeScore) && Math.abs(awayScore - homeScore) < 5) {
        recommendList.push({
          playtype: `${awayScore > homeScore ? teamAway : teamHome}PK`,
          star: 2
        })
      }

      if (Math.abs(awayScore - homeScore) < 3) {
        recommendList.push({
          playtype: `${awayScore > homeScore ? teamAway : teamHome}PK`,
          star: 1
        })
      }
    }

    // 6-2. 讓分盤
    if (strongScore != weakScore) {
      if (Math.abs(strongScore - weakScore) >= 5) {
        recommendList.push({
          playtype: `${strongScore > weakScore ? `${strongTeam}讓分` : `${weakTeam}受讓`}`,
          star: 3
        })
      }

      if (3 <= Math.abs(strongScore - weakScore) && Math.abs(strongScore - weakScore) < 5) {
        recommendList.push({
          playtype: `${strongScore > weakScore ? `${strongTeam}讓分` : `${weakTeam}受讓`}`,
          star: 2
        })
      }

      if (Math.abs(strongScore - weakScore) < 3) {
        recommendList.push({
          playtype: `${strongScore > weakScore ? `${strongTeam}讓分` : `${weakTeam}受讓`}`,
          star: 1
        })
      }
    }

    // 6-3. 大小盤
    if (bigScore != smallScore) {
      if (Math.abs(bigScore - smallScore) >= 5) {
        recommendList.push({
          playtype: `${teamAway}場 ${bigScore > smallScore ? '大分' : '小分'}`,
          star: 3
        })
      }

      if (3 <= Math.abs(bigScore - smallScore) && Math.abs(bigScore - smallScore) < 5) {
        recommendList.push({
          playtype: `${teamAway}場 ${bigScore > smallScore ? '大分' : '小分'}`,
          star: 2
        })
      }

      if (Math.abs(bigScore - smallScore) < 3) {
        recommendList.push({
          playtype: `${teamAway}場 ${bigScore > smallScore ? '大分' : '小分'}`,
          star: 1
        })
      }
    }
  }

  return cb(null, recommendList)
}
