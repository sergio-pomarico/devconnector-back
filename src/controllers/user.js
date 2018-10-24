/**
 * Import dependencies
 */
const gravatar = require('gravatar')

/**
 * Import services
 */
const auth = require('../services/token')

/*
 * Import Models
 */
const User = require('../models/user')

/**
 * [create new user]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of creating a new user]
 */
const save = (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) return res.status(200).send({ success: false, message: 'The email is already registered' })

    const data = req.body
    const avatar = gravatar.url(req.body.email, {
      s: '200', // Size
      r: 'pg', // Rating
      d: 'mm' // Default
    })

    const newUser = new User({
      name: data.name,
      email: data.email,
      avatar: avatar,
      password: data.password
    })

    newUser.save().then(userStored => {
      return res.status(200).send({
        success: true,
        user: userStored
      })
    }).catch((errCreteUser) => {
      console.log(errCreteUser)
      return res.status(500).send({ success: false, message: errCreteUser })
    })
  }).catch((err) => {
    if (err.message) return res.status(500).send({ success: false, message: err.message })
    return res.status(500).send({ success: false, message: err })
  })
}

/**
 * [Login a user]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of creating a new user]
 */
const login = (req, res) => {
  const email = req.body.email
  const password = req.body.password

  User.findOne({ email }).select('_id name email avatar').then(user => {
    if (!user) return res.status(200).send({ success: false, message: 'user not register' })
    User.getAuthenticated(email, password, (errAuth, userLoggedin, reason) => {
      if (errAuth) return res.status(500).send({ success: false, message: errAuth })
      if (userLoggedin) return res.status(200).send({ success: true, user: user, token: auth.createToken(userLoggedin) })
      const reasons = User.failedLogin

      switch (reason) {
        case reasons.NOT_FOUND:
          res.status(404).send({ success: false, message: 'user not register' })
          break
        case reasons.PASSWORD_INCORRECT:
          // note: these cases are usually treated the same - don't tell
          // the user *why* the login failed, only that it did
          res.status(200).send({ success: false, message: 'error in the info provided' })
          break
        case reasons.MAX_ATTEMPTS:
          // send email or otherwise notify user that account is
          // temporarily locked
          res.status(200).send({
            success: false,
            message: 'maximum attempts allowed to log in, that account is temporarily locked'
          })
          break
      }
    })
  }).catch(err => res.status(500).send({ success: false, message: err }))
}

/**
 * [Get data of current user]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [user data]
 */
const current = (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  })
}

module.exports = {
  save,
  login,
  current
}
