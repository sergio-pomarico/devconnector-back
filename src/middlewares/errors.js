/*
 * Import dependencies
 */
const log = require('../libs/log');

const error = {};

error.e404 = (req, res, next) => {
  res.status(404);
  log.info('%s %d %s', req.method, res.statusCode, req.url);
  res.json({
    success: false,
    message: 'Not found',
  });
  next();
};

error.e500 = (err, req, res, next) => {
  res.status(err.status || 500);
  log.error('%s %d %s', req.method, res.statusCode, err.message);
  res.json({
    success: false,
    message: err.message,
  });
  next(err);
};

module.exports = error;
