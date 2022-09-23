'use strict'

const express = require('express')
const port = process.env.PORT || 8000
const router = require('./router')

const app = express()

router(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
