module.exports = app => {
  require('./controller/login')(app)
  require('./controller/sports')(app)
  require('./controller/banks')(app)
}
