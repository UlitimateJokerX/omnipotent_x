'use strict'

const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const port = process.env.PORT || 8000
const router = require('./router')

const app = express()

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')))

app.use(bodyParser.urlencoded({ extended: true, limit: '3mb' }))
app.use(bodyParser.json())

router(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})