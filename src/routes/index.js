/*
 * Import dependencies
 */
const express = require('express')
const path = require('path')
const passport = require('passport')

/*
 * Initilize routerå
 */
const router = express.Router()

/**
 * Import models
 */
const user = require('../controllers/user')

/**
 * @route GET /
 * @desc frontend routes
 * @access public
 */
router.get('/', express.static(path.join(__dirname, 'public')))

/**
 * @route POST /api/register
 * @desc register a user
 * @access public
 */
router.post('/api/user/register', user.save)

/**
 * @route GET /api/user/login
 * @desc login a user / return token
 * @access public
 */
router.post('/api/user/login', user.login)

/**
 * @route   GET api/users/current
 * @desc    Return current user
 * @access  Private
 */
router.get('/api/user/current', passport.authenticate('jwt', { session: false }), user.current)

module.exports = router
