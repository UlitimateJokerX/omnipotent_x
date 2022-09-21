const argvs = process.argv.slice(2);
const url = argvs[0];

const request = require('request');

function show () {
  request(url, (err, response, body) => {
    if (err) {
      console.log(err);
    }

    // 廣島 養樂多
    const oneAScore = Number(body.split('8147692_as_b">')[1].split('<')[0]);
    const oneBScore = Number(body.split('8147692_hs_b">')[1].split('<')[0]);
    const oneInning = body.split('8147692_inning">')[1].split('<')[0].trim();

    // 橫濱 中日
    const twoAScore = Number(body.split('8147693_as_b">')[1].split('<')[0]);
    const twoBScore = Number(body.split('8147693_hs_b">')[1].split('<')[0]);
    const twoInning = body.split('8147693_inning">')[1].split('<')[0].trim();

    // 巨人 阪神
    const threeAScore = Number(body.split('8147694_as_b">')[1].split('<')[0]);
    const threeBScore = Number(body.split('8147694_hs_b">')[1].split('<')[0]);
    const threeInning = body.split('8147694_inning">')[1].split('<')[0].trim();

    // 火腿 羅德
    const fourAScore = Number(body.split('8147695_as_b">')[1].split('<')[0]);
    const fourBScore = Number(body.split('8147695_hs_b">')[1].split('<')[0]);
    const fourInning = body.split('8147695_inning">')[1].split('<')[0].trim();

    // 歐力士 軟銀
    const fiveAScore = Number(body.split('8147696_as_b">')[1].split('<')[0]);
    const fiveBScore = Number(body.split('8147696_hs_b">')[1].split('<')[0]);
    const fiveInning = body.split('8147696_inning">')[1].split('<')[0].trim();

    console.log(`[${oneInning}]廣島 ${oneAScore} : ${oneBScore} 養樂多\n廣島 < 4.5：${oneAScore < 4.5 ? '過關' : '失敗'}\n養樂多PK：${oneAScore <= oneBScore ? '過關' : '失敗' }`);
    console.log('＝＝＝＝＝');
    console.log(`[${twoInning}]橫濱 ${twoAScore} : ${twoBScore} 中日\n橫濱 > 2.5：${twoAScore > 2.5 ? '過關' : '失敗'}`);
    console.log('＝＝＝＝＝');
    console.log(`[${threeInning}]巨人 ${threeAScore} : ${threeBScore} 阪神\n阪神 > 2.5：${threeBScore > 2.5 ? '過關' : '失敗'}`);
    console.log('＝＝＝＝＝');
    console.log(`[${fourInning}]火腿 ${fourAScore} : ${fourBScore} 羅德\n羅德 + 1.5：${fourAScore < (fourBScore + 1.5) ? '過關' : '失敗'}`);
    console.log('＝＝＝＝＝');
    console.log(`[${fiveInning}]歐力士 ${fiveAScore} : ${fiveBScore} 軟銀\n歐力士PK：${fiveAScore >= fiveBScore ? '過關' : '失敗'}`);
  });
}

show();
