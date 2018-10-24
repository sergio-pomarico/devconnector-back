/*
 * Import dependencies
 */
const jwt = require('jsonwebtoken')
const moment = require('moment')

/**
 * Create json web token from user info
 * @param {*} user
 * @returns token
 */
function createToken (user) {
  const payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(1, 'days').unix()
  }
  const token = 'Bearer ' + jwt.sign(payload, process.env.SECRET)
  return token
}

module.exports = { createToken }
