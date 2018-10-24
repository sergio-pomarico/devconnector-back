/**
 * [validate if a value if diferent to undefined, empty and null]
 * @param  {string} value
 * @param  {Object} res
 * @return {boolean}
 */
const isEmpty = value => value === undefined || value === null || (typeof value === 'object' && Object.keys(value).length === 0) || (typeof value === 'string' && value.trim().length === 0)

/**
 * Exports dependencies
 */
module.exports = {
  isEmpty
}
