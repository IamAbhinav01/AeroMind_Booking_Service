const dotenv = require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  logger_level: process.env.logger_level,
  FLIGHT_API: process.env.FLIGHT_API,
};
