const { default: axios } = require('axios');
const { LoggerConfig, ServerConfig } = require('../config');

const { ErrorHandler } = require('../errors');

const createBooking = async (request) => {
  try {
    const response = await axios.get(
      `${ServerConfig.FLIGHT_API}/${request.flightId})`
    );

    const flightDetails = response.data.data;

    if (request.noOfSeats > flightDetails.totalSeats) {
      throw new ErrorHandler(
        'the requested seats is larger than the available seats'
      );
    }

    const totalAmount = request.noOfSeats * flightDetails.price;
    console.log(totalAmount);
    LoggerConfig.info(`Sucessfully recieved data from flight service`);
  } catch (error) {
    let explanation = error.message;
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    if (error.name === 'SequelizeValidationError') {
      explanation = error.errors.map((err) => err.message).join(', ');
      statusCode = StatusCodes.BAD_REQUEST;
    }

    LoggerConfig.error(`error occured ERROR : ${error}
      \n Error Name: ${error.name}`);
    throw new ErrorHandler(explanation, statusCode);
  }
};

module.exports = { createBooking };
