const mysql = require('mysql')
const conn = mysql.createConnection({
	host:'127.0.0.1',
	user:'root',
	password:'cullenhsu0506',
	database:'cos'
})

conn.connect(err => {
  if (err) {
    console.log('MySql Connection Error!')

    return
  }
})

module.exports = conn