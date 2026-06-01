const { default: axios } = require('axios');
const { LoggerConfig } = require('../config');

const createBooking = async (data) => {
  console.log('data:', data);
  const flightDetails = await axios.get(
    `http://localhost:3000/api/v1/flights/${data.flightId})`
  );
  console.log(flightDetails);
  LoggerConfig.info(`Sucessfully recieved data from flight service`);
  return flightDetails;
};

module.exports = { createBooking };
