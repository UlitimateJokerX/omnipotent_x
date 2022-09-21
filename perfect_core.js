'use strict'

const clone = require('lodash.clone')
const skills = [1, 2, 3, 4, 5, 6, 7, 8, 9]
let allCombinations = []

for (let i in skills) {
  let mainSkill = skills[i]
  const remainSkills = skills.filter(s => {
    return s !== skills[i]
  })
  const remainSkillsTwo = clone(remainSkills)

  for (let j in remainSkills) {
    const firstSkill = remainSkills[j]

    for (let k in remainSkillsTwo) {
      if (j == k) {continue};
      const secondSkill = remainSkillsTwo[k]

      allCombinations.push(`${firstSkill}${secondSkill}${mainSkill}`)
    }
  }
}

function get_random (list) {
  return list[Math.floor((Math.random()*list.length))];
}

let ramdomCombinations = []

for (let x = 0; x <= 999; x++) {
  if (!ramdomCombinations.includes(get_random(allCombinations))) {
    ramdomCombinations.push(get_random(allCombinations))
  }

  if (ramdomCombinations.length >= 300) {
    break
  }
}

console.log(ramdomCombinations.toString())

// 數字轉換技能名稱
const mainSkillMap = {
  1: '幻影分身符/仙技：分身遁甲太乙仙人',
  2: '卷術：蝴蝶之夢',
  3: '如意扇：人/金箍棒：人',
  4: '土波流/地震碎',
  5: '芭蕉風/滅火炎',
  6: '魔封葫蘆符/遁甲千斤石',
  7: '追擊鬼火符',
  8: '卷術：吸星渦流',
  9: '卷術：微生強變'
}
const skillMap = {
  1: '分身',
  2: '蝴蝶',
  3: '人',
  4: '地',
  5: '天',
  6: '魔封',
  7: '追蹤',
  8: '渦流',
  9: '強變'
}
const perfectCoreNumber = [[ 3, 1, 5 ],[ 4, 1, 3 ],[ 6, 2, 9 ],[ 5, 8, 4 ],[ 2, 7, 8 ],[ 9, 7, 6 ]]

for (let sss in perfectCoreNumber) {
  const skillOneNumbber = perfectCoreNumber[sss][0]
  const skillTwoNumbber = perfectCoreNumber[sss][1]
  const skillThreeNumbber = perfectCoreNumber[sss][2]

  const skillOneName = skillMap[skillOneNumbber]
  const skillTwoName = skillMap[skillTwoNumbber]
  const skillThreeName = mainSkillMap[skillThreeNumbber]

  console.log(`核心${Number(sss) + 1}：${skillOneName}/${skillTwoName}/${skillThreeName}`)
}