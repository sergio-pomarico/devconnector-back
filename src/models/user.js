/*
 * Import dependencies
 */
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const mongoosePaginate = require('mongoose-paginate')
const bcrypt = require('bcrypt')

/*
 * configuration of allowed attempts
 */
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000

/**
 * [User model]
 * @type {Schema}
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"]
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  password: { type: String, required: true },
  avatar: String,
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number }
}, { timestamps: true })

/**
 * [Reasons code to login failed]
 * @type {Object}
 */
const reasons = userSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2
}

/**
 * [encrypt the password as long as the user is saved]
 * @type {method}
 */
userSchema.pre('save', function (next) {
  const user = this

  // if password hasn't been modified return
  if (!user.isModified('password')) return next()

  // generate a salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, (errHash, hash) => {
      // override the cleartext password with the hashed one
      if (errHash) return next(errHash)
      user.password = hash
      next()
    })
  })
})

/**
 * [update updatedAt middleware]
 */
userSchema.pre('update', function () {
  this.update({}, { $set: { updatedAt: new Date() } })
})

/**
 * [return true o false if a user is locked]
 * @type  {method}
 * @return {bolean}
 */
userSchema.virtual('isLocked').get(function () {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

/**
 * [count and update the user login attempts]
 * @type  {method}
 * @param  {function} callback(err, isMatch)
 * @return {Object} user object updated and callback
 */
userSchema.methods.incLoginAttempts = function (callback) {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    }, callback)
  }

  // otherwise we're incrementing
  const updates = { $inc: { loginAttempts: 1 } }

  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME }
  }
  return this.update(updates, callback)
}

/**
 * [count and update the user login attempts]
 * @type  {method}
 * @param  {string} password
 * @param  {function} callback(err, isMatch)
 * @return {bolean} isMatch return true o false if password is correct
 */
userSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (!err) return callback(null, isMatch)
    return callback(err)
  })
}

/**
 * [count and update the user login attempts]
 * @type  {method}
 * @param  {string} email
 * @param  {string} password
 * @param  {function} callback(err, user, reason)
 * @return {function} return to callback with the result to login to user
 */
userSchema.statics.getAuthenticated = function (email, password, callback) {
  this.findOne({ email }, (err, user) => {
    if (err) return callback(err)

    // make sure the user exists
    if (!user) return callback(null, null, reasons.NOT_FOUND)

    user.comparePassword(password, (errCompare, isMatch) => {
      if (errCompare) return callback(errCompare)

      if (isMatch) {
        // if there's no lock or failed attempts, just return the user
        if (!user.loginAttempts && !user.lockUntil) return callback(null, user)

        // reset attempts and lock info
        const updates = {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 }
        }

        return user.update(updates, (errUpdate) => {
          if (errUpdate) return callback(errUpdate)
          return callback(null, user)
        })
      } else {
        // password is incorrect, so increment login attempts before responding
        user.incLoginAttempts((errUser) => {
          if (errUser) return callback(errUser)
          return callback(null, null, reasons.PASSWORD_INCORRECT)
        })
      }
    })
  })
}

/*
 * custom message for duplicate index
 */
userSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' })

/**
 * Paginate
 */
userSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('User', userSchema)
