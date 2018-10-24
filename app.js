/*
 * Import dependencies
 */
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const passport = require('passport')

/**
 * config libraries
 */
const database = require('./src/libs/mongo')
const error = require('./src/middlewares/errors')
const log = require('./src/libs/log')
const router = require('./src/routes')

require('dotenv').config()

/**
 * [initialize express framework]
 * @type {object}
 */
const app = express()

/**
 * [port of server]
 * @type {number}
 */
const port = process.env.PORT || 3000

/**
 * Configure express dependencies
 */
app.use(morgan('combined', { stream: log.stream }))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(helmet())

/**
 * Passport middleware
 */
app.use(passport.initialize())

/*
 * Passport Config
 */
require('./src/services/passport')(passport)

/**
 * import routes
 */
app.use('/', router)

/**
 * error 404 and 500 handler
 */
app.use(error.e404)
app.use(error.e500)

/**
 * [run the conenction of database an http server]
 * @type {Object} express intance
 * @type {Number} port of http server
 */
database.connect(app, port)

module.exports = app
