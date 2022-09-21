'use strict'

module.exports = tools

const moment = require('moment')

function tools (app) {
  /**
   * GET /annual_leave
   *
   * 特休頁面
   */
  app.get('/annual_leave', (req, res) => {
    res.render('pages/annual-leave.ejs')
  })

  /**
   * GET /api/annual_leave_distribution
   *
   * 計算特休分配
   */
  app.get('/api/annual_leave_distribution', (req, res) => {
    const holidays = require('../config').holidays
    const hours = req.query.hours
    let endDate = req.query.end_date
    const [hourTypeOne, hourTypeTwo, hourTypeThree] = [8, 4.5, 3.5]
    let data = {}

    return getTotalDays()

    /**
     * 取得相隔總天數
     */
    function getTotalDays () {
      const now = moment()
      const end = moment(endDate)

      data['duration_days'] = end.diff(now, 'days')

      return getWorkDays()
    }

    /**
     * 取得工作日
     */
    function getWorkDays () {
      const durationDays = data['duration_days']
      let workDays = 0

      for (let d = 1; d <= durationDays; d++) {
        const now = moment()
        now.add(d, 'days')

        if (now.weekday() == 6 || now.weekday() == 0) {
          continue
        }

        if (holidays.includes(now.format('YYYY-MM-DD'))) {
          continue
        }

        workDays = workDays + 1
      }

      data['work_days'] = workDays

      return getCombination()
    }

    /**
     * 取得組合分配
     */
    function getCombination () {
      const combinations = []
      const typeOneMax = parseInt(hours / hourTypeOne)

      // 8小開頭
      for (let i = typeOneMax; i >= 0; --i) {
        let oneLast = hours - (hourTypeOne * i)

        // 4.5小
        if (oneLast >= hourTypeTwo) {
          let typeTwoMax = parseInt(oneLast / hourTypeTwo)

          for (let j = typeTwoMax; j >= 0; --j) {
            let twoLast = oneLast - (hourTypeTwo * j)

            if (twoLast < hourTypeThree) {
              combinations.push({
                '8': i,
                '4.5': j,
                '3.5': 0
              })
            }

            // 3.5小
            if (twoLast >= hourTypeThree) {
              let typeThreeMax = parseInt(twoLast / hourTypeThree)

              for (let k = typeThreeMax; k >= 0; --k) {
                let threeLast = twoLast - (hourTypeThree * k)

                if (threeLast >= hourTypeThree) {
                  continue
                }

                combinations.push({
                  '8': i,
                  '4.5': j,
                  '3.5': k
                })
              }
            }
          }
        }

        if (oneLast < hourTypeThree) {
          combinations.push({
            '8': i,
            '4.5': 0,
            '3.5': 0
          })
        }
      }

      data['combinations'] = combinations

      return res.json({result: 'ok', ret: data})
    }
  })
}