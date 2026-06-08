const { default: axios } = require('axios');
const { StatusCodes } = require('http-status-codes');
const { LoggerConfig, ServerConfig } = require('../config');
const { ErrorHandler } = require('../errors');
const { BookingRepository } = require('../repositories');
const { Enums } = require('../utils/common');
const { BookingStatus } = Enums;

const db = require('../models');
const bookingRepository = new BookingRepository();

const createBooking = async (request) => {
  const t = await db.sequelize.transaction();
  try {
    const response = await axios.get(
      `${ServerConfig.FLIGHT_API}/${request.flightId}`
    );
    const flightDetails = response.data.data;

    if (request.noOfSeats > flightDetails.totalSeats) {
      await t.rollback();
      throw new ErrorHandler(
        `Not enough seats. Requested: ${request.noOfSeats}, Available: ${flightDetails.totalSeats}`,
        StatusCodes.BAD_REQUEST
      );
    }

    LoggerConfig.info(
      `[Locking] Fetched flight ${request.flightId}: ${flightDetails.totalSeats} seats available`
    );

    const totalCost = request.noOfSeats * flightDetails.price;

    await axios.patch(`${ServerConfig.FLIGHT_API}/${request.flightId}/seats`, {
      seats: request.noOfSeats,
      dec: true,
    });

    LoggerConfig.info(
      `[Locking] Seat count updated for flight ${request.flightId}`
    );

    const booking = await bookingRepository.create(
      {
        flightId: request.flightId,
        userId: request.userId,
        noOfSeats: request.noOfSeats,
        totalCost,
      },
      t
    );

    await t.commit();

    LoggerConfig.info(
      `[Locking] Booking ${booking.id} committed successfully for user ${request.userId}`
    );

    return booking;
  } catch (error) {
    try {
      await t.rollback();
      LoggerConfig.warn(`[Locking] Transaction rolled back: ${error.message}`);
    } catch (rollbackError) {
      LoggerConfig.error(`[Locking] Rollback failed: ${rollbackError.message}`);
    }

    if (error instanceof ErrorHandler) throw error;

    let explanation = error.message;
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    if (error.name === 'SequelizeValidationError') {
      explanation = error.errors.map((err) => err.message).join(', ');
      statusCode = StatusCodes.BAD_REQUEST;
    }

    LoggerConfig.error(
      `[Locking] Error in createBooking — ${error.name}: ${error.message}`
    );
    throw new ErrorHandler(explanation, statusCode);
  }
};

const updateBooking = async (bookingId, status, t) => {
  try {
    const booking = await bookingRepository.update(bookingId, { status }, t);
    return booking;
  } catch (error) {
    LoggerConfig.error(
      `[Locking] Error in updateBooking — ${error.name}: ${error.message}`
    );
    throw new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const makePayment = async (data) => {
  const t = await db.sequelize.transaction();
  try {
    const booking = await bookingRepository.lockBookings(data.bookingId, t);

    // console.log('the complete booking details: ', booking.dataValues.createdAt);
    if (!booking) {
      await t.rollback();
      throw new ErrorHandler('Booking not found', StatusCodes.NOT_FOUND);
    }

    if (booking.status === BookingStatus.CONFIRM) {
      await t.rollback();
      throw new ErrorHandler(
        'Payment already completed',
        StatusCodes.BAD_REQUEST
      );
    }

    if (booking.status === BookingStatus.CANCEL) {
      await t.rollback();
      throw new ErrorHandler(
        'Booking is cancelled, cannot pay',
        StatusCodes.BAD_REQUEST
      );
    }

    if (Number(booking.dataValues.totalCost) !== Number(data.totalCost)) {
      await t.rollback();
      throw new ErrorHandler('Total cost mismatch', StatusCodes.BAD_REQUEST);
    }

    //checking if booking is taking too long to cnfrm
    const bookingTime = new Date(booking.dataValues.createdAt).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = (currentTime - bookingTime) / (1000 * 60); // in minutes
    if (timeDiff > 5) {
      await updateBooking(data.bookingId, BookingStatus.CANCEL, t);
      await t.commit();

      throw new ErrorHandler(
        'Booking timed out and has been cancelled',
        StatusCodes.NOT_FOUND
      );
    }

    const updatedBooking = await updateBooking(
      data.bookingId,
      BookingStatus.CONFIRM,
      t
    );
    await t.commit();
    return updatedBooking;
  } catch (error) {
    try {
      await t.rollback();
      LoggerConfig.warn(`[Locking] Transaction rolled back: ${error.message}`);
    } catch (rollbackError) {
      LoggerConfig.error(`[Locking] Rollback failed: ${rollbackError.message}`);
    }

    if (error instanceof ErrorHandler) throw error;

    let explanation = error.message;
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    if (error.name === 'SequelizeValidationError') {
      explanation = error.errors.map((err) => err.message).join(', ');
      statusCode = StatusCodes.BAD_REQUEST;
    }

    LoggerConfig.error(
      `[Locking] Error in generating booking — ${error.name}: ${error.message}`
    );
    throw new ErrorHandler(explanation, statusCode);
  }
};

const cancelBooking = async (bookingId) => {
  const t = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(bookingId, t);

    if (!bookingDetails) {
      await t.rollback();
      LoggerConfig.warn(
        `[Locking] Booking ${bookingId} not found for cancellation`
      );
      throw new ErrorHandler('Booking not found', StatusCodes.NOT_FOUND);
    }

    if (bookingDetails.status === BookingStatus.CANCEL) {
      await t.rollback();
      LoggerConfig.warn(`[Locking] Booking ${bookingId} is already cancelled`);
      throw new ErrorHandler(
        'Booking is already cancelled.',
        StatusCodes.BAD_REQUEST
      );
    }

    await axios.patch(
      `${ServerConfig.FLIGHT_API}/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: false,
      }
    );

    const updatedBooking = await updateBooking(
      bookingId,
      BookingStatus.CANCEL,
      t
    );
    LoggerConfig.info(
      `[Locking] Booking ${bookingId} cancelled successfully and seats released`
    );
    await t.commit();
    return updatedBooking;
  } catch (error) {
    try {
      await t.rollback();
      LoggerConfig.warn(`[Locking] Transaction rolled back: ${error.message}`);
    } catch (rollbackError) {
      LoggerConfig.error(`[Locking] Rollback failed: ${rollbackError.message}`);
    }

    if (error instanceof ErrorHandler) throw error;

    let explanation = error.message;
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    if (error.name === 'SequelizeValidationError') {
      explanation = error.errors.map((err) => err.message).join(', ');
      statusCode = StatusCodes.BAD_REQUEST;
    }

    LoggerConfig.error(
      `[Locking] Error in cancelBooking — ${error.name}: ${error.message}`
    );
    throw new ErrorHandler(explanation, statusCode);
  }
};
const cancelOldBooking = async () => {
  try {
    const currentTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const response = await bookingRepository.cancelOldBooking(currentTime);
    LoggerConfig.info(
      `[Cron] Old INITIATED bookings cancelled successfully. Updated count: ${response[0]}`
    );
    return response;
  } catch (error) {
    LoggerConfig.error(
      `[Cron] Error in cancelOldBooking — ${error.name}: ${error.message}`
    );
    throw new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
module.exports = {
  createBooking,
  makePayment,
  cancelBooking,
  cancelOldBooking,
};
