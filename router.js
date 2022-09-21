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
  const toolsRoutes = require('./controller/tools')(app)
  const forUXRoutes = require('./controller/forUX')(app)
}