module.exports = app => {
  /**
   * GET /
   *
   * 首頁
   */
  app.get('/', (req, res) => {
    res.render('pages/index.ejs')
  })

  const jpRoutes = require('./controller/jp')(app)
  const userRoutes = require('./controller/user')(app)
  const sportsRoutes = require('./controller/sports')(app)
}