'use strict'

const moment = require('moment')
const rp = require('request-promise-native')
const _ = require('lodash')
const config = require('../config/config.js')
const cheerio = require('cheerio')

// 要分析的網址資訊
const PLAY_SPORT_URL = config.playsport_url
// 球種代號
const ALL_LIANCE_ID_MAP = {
  'MLB': 1,
  'NPB': 2,
  'NBA': 3,
  'SOCCER': 4,
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
const SID_MAP = [1, 3]

/**
 * 取得賽事預測比例
 *
 * @param String sport
 *
 * @returns {Object}
 */
async function getPrediction (sport) {
  const sportKind = ALL_LIANCE_ID_MAP[sport.toUpperCase()]
  let date = moment().format('YYYYMMDD')

  // MLB上午已完賽，預測日期調整為隔天
  if (sport.toUpperCase() === 'MLB' && Number(moment().format('HH')) >= 15) {
    date = moment().add(1, 'd').format('YYYYMMDD')
  }

  // const tableData = await getTableData()

  const matchList = await getMatches()

  await analysisPrediction(matchList, 1)
  await analysisPrediction(matchList, 3)

  return matchList

  // 取得對戰組合
  async function getMatches () {
    const url = `${PLAY_SPORT_URL}allianceid=${sportKind}&gametime=${date}&sid=1`

    const webHtml = await rp({url})

    const $ = cheerio.load(webHtml)
    const matches = []
    let matchId = ''
    let matchTime = ''
    let teamAway = ''
    let teamHome = ''

    // 未完賽
    $('tr.game-unset').each(function (index) {
      if (index % 2 === 0) {
        // 賽事id
        matchId = $(this).attr('gameid')
        // 對戰時間
        matchTime = $(this).find('.td-gameinfo').find('h4').text()
        // 客隊
        teamAway = $(this).find('.td-teaminfo').find('a').text().trim()
        teamHome = ''
      }

      if (index % 2 === 1) {
        teamHome = $(this).find('.td-teaminfo').find('a').text().trim()
        matches.push({
          id: matchId,
          time: matchTime,
          team_away: teamAway,
          team_home: teamHome
        })
      }
    })

    return matches
  }

  // 分析預測
  async function analysisPrediction (matches, sid) {
    const url = `${PLAY_SPORT_URL}allianceid=${sportKind}&gametime=${date}&sid=${sid}`

    const webHtml = await rp({url})

    const $ = cheerio.load(webHtml)
    let awayWinNum = 0
    let homeWinNum = 0
    let handicapWeakNum = 0
    let handicapStrongNum = 0
    let totalBigNum = 0
    let totalSmallNum = 0
    let strongerTeam = 'home'

    $('tr.game-unset').each(function (index) {
      // 賽事id
      const matchId = $(this).attr('gameid')
      // 對應的賽事
      const match = _.find(matches, {id: matchId})

      // 獨贏預測人數
      const winNum = $(this).find('.td-bank-bet03').next('.predict-s').find('.predictor_count_hide').text()
      const whoIsStrongr = $(this).find('.td-bank-bet01').find('span.data-wrap').find('strong').text()
      const handicapNum = $(this).find('.td-bank-bet01').next('.predict-s').find('.predictor_count_hide').text()
      const scoreNum = $(this).find('.td-bank-bet02').next('.predict-s').find('.predictor_count_hide').text()

      // process first line
      if (index % 2 === 0) {
        // 客隊獨贏
        awayWinNum = winNum ? awayWinNum + Number(winNum.split(' 人預測')[0]) : awayWinNum

        if (match.away_win_num) {
          match.away_win_num = match.away_win_num + awayWinNum
        } else {
          match.away_win_num = awayWinNum
        }

        // 讓分盤
        // if first line showup "-x.5" means away team is stronger
        if (whoIsStrongr.match(/-\d+\.5/)) {
          strongerTeam = 'away'

          handicapStrongNum = handicapNum ? handicapStrongNum + Number(handicapNum.split(' 人預測')[0]) : handicapStrongNum

          if (match.handicap_strong_num) {
            match.handicap_strong_num = match.handicap_strong_num + handicapStrongNum
          } else {
            match.handicap_strong_num = handicapStrongNum
          }
        } else {
          strongerTeam = 'home'

          handicapWeakNum = handicapNum ? handicapWeakNum + Number(handicapNum.split(' 人預測')[0]) : handicapWeakNum

          if (match.handicap_weak_num) {
            match.handicap_weak_num = match.handicap_weak_num + handicapWeakNum
          } else {
            match.handicap_weak_num = handicapWeakNum
          }

        }

        match.stronger_team = strongerTeam

        // 大分
        totalBigNum = scoreNum ? totalBigNum + Number(scoreNum.split(' 人預測')[0]) : totalBigNum

        if (match.total_big_num) {
          match.total_big_num = match.total_big_num + totalBigNum
        } else {
          match.total_big_num = totalBigNum
        }
      }

      // process second line
      if (index % 2 === 1) {
        // 主隊獨贏
        homeWinNum = winNum ? homeWinNum + Number(winNum.split(' 人預測')[0]) : homeWinNum

        if (match.homw_win_num) {
          match.homw_win_num = match.homw_win_num + homeWinNum
        } else {
          match.homw_win_num = homeWinNum
        }

        // 讓分盤
        // if second line showup "-x.5" means home team is stronger
        if (whoIsStrongr.match(/-\d+\.5/)) {
          handicapStrongNum = handicapNum ? handicapStrongNum + Number(handicapNum.split(' 人預測')[0]) : handicapStrongNum

          if (match.handicap_strong_num) {
            match.handicap_strong_num = match.handicap_strong_num + handicapStrongNum
          } else {
            match.handicap_strong_num = handicapStrongNum
          }
        } else {
          handicapWeakNum = handicapNum ? handicapWeakNum + Number(handicapNum.split(' 人預測')[0]) : handicapWeakNum

          if (match.handicap_weak_num) {
            match.handicap_weak_num = match.handicap_weak_num + handicapWeakNum
          } else {
            match.handicap_weak_num = handicapWeakNum
          }
        }

        // 小分
        totalSmallNum = scoreNum ? totalSmallNum + Number(scoreNum.split(' 人預測')[0]) : totalSmallNum

        if (match.total_small_num) {
          match.total_small_num = match.total_small_num + totalSmallNum
        } else {
          match.total_small_num = totalSmallNum
        }

        // 重置
        awayWinNum = 0
        homeWinNum = 0
        handicapWeakNum = 0
        handicapStrongNum = 0
        totalBigNum = 0
        totalSmallNum = 0
        strongerTeam = 'home'
      }
    })

    return matches
  }
}

/**
 * 取得賽事推薦玩法
 *
 * @param Object oriRet
 * @param Array  matches
 *
 * @returns {Object}
 */
async function getRecommend (oriRet, recommendMatches) {
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

    const x = _.filter(recommendMatches, rm => {
      return rm.match_id == oriRet[i].match_id
    })

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

  return recommendList
}

module.exports = {
  getPrediction,
  getRecommend
}
