const argvs = require('minimist')(process.argv.slice(2));
const today = argvs['today']

return getResult()

// 計算
function getResult () {
  console.log(today)
}
