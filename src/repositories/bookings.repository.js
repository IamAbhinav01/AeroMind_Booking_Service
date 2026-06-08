const CrudRepository = require('./crudOperations.repository');
const { Bookings } = require('../models');
const { LoggerConfig } = require('../config');
const { Transaction, Op } = require('sequelize');
const { BookingStatus } = require('../utils/common/ennum');

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
      const response = await this.model.update(data, {
        where: {
          id: modelId,
        },
        transaction: t,
      });
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
  async get(modelId, t) {
    try {
      const response = await Bookings.findByPk(modelId, { transaction: t });
      LoggerConfig.info(
        `Successfully found data from the Database --> repository layer`
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

  async cancelOldBooking(time) {
    try {
      const response = await Bookings.update(
        {
          status: BookingStatus.CANCEL,
        },
        {
          where: {
            status: BookingStatus.INITIATED,
            createdAt: {
              [Op.lt]: time,
            },
          },
        }
      );
      LoggerConfig.info(
        `Successfully cancelled old INITIATED bookings from the Database --> repository layer`
      );
      return response;
    } catch (error) {
      console.log('error occured while finding data from database');
      LoggerConfig.error(
        `error occured while finding data from database:${error}`
      );
      throw error;
    }
    /*  UPDATE bookings
        SET status = 'CANCEL'
        WHERE status = 'INITIATED'
        AND createdAt < time; 
    */
  }
}

module.exports = { BookingRepository };
