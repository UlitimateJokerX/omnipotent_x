module.exports = app => {
  require('./controller/sports')(app)
  require('./controller/banks')(app)
}
