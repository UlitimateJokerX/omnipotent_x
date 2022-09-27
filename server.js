'use strict'

const express = require('express')
const port = process.env.PORT || 8000
const router = require('./router')

const app = express()

app.use(express.json())

router(app);

app.listen(port, () => {
  console.log(`Omnipotent System is running on ${port} port!`)
})
