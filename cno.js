const argvs = process.argv.slice(2);
const type = argvs[0];
const cno = argvs[1];
const key = argvs[2];
const keyJS = argvs[3];
const Cryptr = require('cryptr')
const CryptoJS = require('crypto-js');

return checkInputs()

// check arguments
function checkInputs () {
  // no type specified or wrong type
  if (!type || (type !== 'en' && type !== 'de')) {
    console.log('error: 0')

    process.exit(1)
  }

  // no cno or encrypted string specified
  if (!cno) {
    console.log('error: 1')

    process.exit(1)
  }

  // en type but wrong cno length
  if (cno && type == 'en' && cno.length !== 23) {
    console.log('error: 1-1')

    process.exit(1)
  }

  return doSomething()
}

// start process
function doSomething () {
  const cryptr = new Cryptr(key)
  const CryptoJSOption = {
    mode: CryptoJS.mode.ECB
  };

  // 加
  if (type === 'en') {
    const encryptedStringOrigin = cryptr.encrypt(cno)
    const encryptedString2 = CryptoJS.AES.encrypt(encryptedStringOrigin, keyJS, CryptoJSOption)

    console.log(encryptedString2.toString())
  }

  // 解
  if (type === 'de') {
    try {
      const decryptedString2 = CryptoJS.AES.decrypt(cno, keyJS, CryptoJSOption).toString(CryptoJS.enc.Utf8)
      const decryptedStringOrigin = cryptr.decrypt(decryptedString2)

      console.log(decryptedStringOrigin)
    } catch (e) {
      console.log('Hahaha chill si wa')

      process.exit(1)
    }
  }
}
