const CrudRepository = require('./crudOperations.repository');
const { Bookings } = require('../models');
const { LoggerConfig } = require('../config');

class BookingRepository extends CrudRepository {
  constructor() {
    super(Bookings);
  }
  async create(data, t) {
    try {
      const response = await Bookings.create(data, { transaction: t });
      LoggerConfig.info(
        `Successfully added data to the Database --> repository layer`
      );
      return response;
    } catch (error) {
      console.log('error occured while creating data to database');
      LoggerConfig.error(
        `error occured while creating data to database ERROR:${error}`
      );
      throw error;
    }
  }

}

module.exports = { BookingRepository };
