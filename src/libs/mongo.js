/*
 * Import dependencies
 */
const mongo = require('mongoose')

const database = {}

/*
 * Connect with the database
 */
database.connect = (app, port) => {
  const url = `mongodb://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@ds235243.mlab.com:35243/dev_connector`
  mongo.Promise = global.Promise
  mongo.connect(url, { useNewUrlParser: true })
    .then(() => {
      console.log('database connection success') // eslint-disable-line
      app.listen(port, () => {
        console.log(`app running on port ${port}`) // eslint-disable-line
      })
    })
    .catch((err) => {
      console.log(err) // eslint-disable-line
    })
}

module.exports = database
