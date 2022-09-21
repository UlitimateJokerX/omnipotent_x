const argvs = require('minimist')(process.argv.slice(2));
const cost = Number(argvs['secret']); // 牌費
const eachBet = Number(argvs['each_bet']); // 每注金額
const odds = Number(argvs['odds']); // 賠率
const days = Number(argvs['days']); // 包牌天數
const hasBouns = argvs['show_bonus']; // 是否顯示補場

return show()

function show () {
  // 成本
  const weeklyCost = days * eachBet
  // 返水
  const weeklyRebates = Math.round(weeklyCost * 0.043)

  console.log(`牌費: ${cost}(${days}天), 每注金額: ${eachBet}, 預期賠率: ${odds}`)
  console.log(`總成本: ${weeklyCost + cost}${hasBouns == 'true' ? `, 若含補場(假設全倒), 總本金：${weeklyCost + cost + days * eachBet}` : ''}`)
  console.log(`總返水: ${weeklyRebates}\n`)

  for (let p = days; p >= 0; p--) {
    // 所有可能性
    let l = days - p
    console.log(`過${p}倒${l}:`)
    
    // 獎金(包含成本)
    const weeklyWinnings = p * eachBet * odds
    // 損益
    const weeklyProfitAndLoss = weeklyWinnings - weeklyCost - cost + weeklyRebates

    console.log(` 總回本: ${weeklyWinnings}\n 總損益: ${weeklyProfitAndLoss}`)

    // 補場機制
    if (hasBouns == 'true' && p < days) {
      console.log(`\n 補場：`)

      for (let i = l; i >= 0; i--) {
        const bonusCost = l * eachBet
        const bonusWinnings = i * eachBet * odds
        const bonusRebates = Math.round(bonusCost * 0.043)
        const bonusProfitAndLoss = bonusWinnings - bonusCost

        console.log(` 補${l}過${i}: ${bonusProfitAndLoss}, 結果: ${weeklyProfitAndLoss + bonusProfitAndLoss + bonusRebates}`)
      }
    }

    console.log('=====')
  }
}
