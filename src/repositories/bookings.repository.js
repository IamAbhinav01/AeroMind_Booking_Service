const CrudRepository = require('./crudOperations.repository');
const { Bookings } = require('../models');
const { LoggerConfig } = require('../config');
const { Transaction } = require('sequelize');

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

  async lockBookings(bookingId, t) {
    try {
      const booking = await Bookings.findOne({
        where: {
          id: bookingId,
        },
        transaction: t,
        lock: Transaction.LOCK.UPDATE,
      });
      return booking;
    } catch (error) {
      console.log('error occured while locking booking');
      LoggerConfig.error(`error occured while locking booking ERROR:${error}`);
      throw error;
    }
  }

  async update(modelId, data, t) {
    try {
      const response = await this.model.update(
        data,
        {
          where: {
            id: modelId,
          },
          transaction: t,
        }
      );
      LoggerConfig.info(
        `Successfully updated data in the Database --> repository layer`
      );
      return response;
    } catch (error) {
      console.log('error occured while finding data from database');
      LoggerConfig.error(
        `error occured while finding data from database:${error}`
      );
      throw error;
    }
  }
}

module.exports = { BookingRepository };
