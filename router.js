module.exports = app => {
  require('./controller/user')(app)
  require('./controller/sports')(app)
}
