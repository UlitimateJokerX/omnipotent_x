const argvs = process.argv.slice(2);
const target = argvs[0]
const url = argvs[1];

const request = require('request');
const schedule = require('node-schedule');

function show () {
  request(url, (err, response, body) => {
    if (err) {
      console.log(err);
    }

    const aScore = Number(body.split('asr_big">')[1].split('<')[0]);
    const bScore = Number(body.split('hsr_big">')[1].split('<')[0]);
    const timeLeft = body.split('trm_big">')[1].split('<')[0].trim();
    const diff = target - (aScore + bScore);
 
    console.log(`${aScore} : ${bScore}, 目標還差: ${diff} 分, 時間剩餘 ${timeLeft}`);
  });
}

const everySecond = []

for (let i = 0; i < 60; i++) {
  everySecond.push(i)
}

const rule = new schedule.RecurrenceRule();

rule.second = everySecond;

schedule.scheduleJob(rule, show);
