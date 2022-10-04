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
      // 讓分盤預測人數
      const whoIsStrongr = $(this).find('.td-bank-bet01').find('span.data-wrap').find('strong').text()
      const handicapNum = $(this).find('.td-bank-bet01').next('.predict-s').find('.predictor_count_hide').text()
      // 大小分預測人數
      const totalScore = $(this).find('.td-bank-bet02').find('span.data-wrap').find('strong').text()
      const scoreNum = $(this).find('.td-bank-bet02').next('.predict-s').find('.predictor_count_hide').text()

      // 移除尚無盤口之賽事
      if (!totalScore) {
        return _.remove(matches, m => {
          return m.id === matchId
        })
      }

      match.total_score = totalScore

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
        match.handicap_score = whoIsStrongr.replace('+', '').replace('-', '')

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

        if (match.home_win_num) {
          match.home_win_num = match.home_win_num + homeWinNum
        } else {
          match.home_win_num = homeWinNum
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

module.exports = {
  getPrediction
}
