var bignumber = require("bignumber.js")
bignumber.config({ DECIMAL_PLACES: 10, ROUNDING_MODE: 4, ERRORS: false })

module.exports = bignumber;