const cron = require('node-cron');
const { LoggerConfig } = require('../../config');
const BookingService = require('../../services/bookings.service');

const scheduleOldBookingCancellation = () => {
  let timer = 0;
  cron.schedule('*/1 * * * *', async () => {
    timer++;
    LoggerConfig.info(
      `Running old booking cancellation task, execution count: ${timer}`
    );
    try {
      await BookingService.cancelOldBooking();
      LoggerConfig.info(`Old booking cancellation task completed successfully`);
    } catch (error) {
      LoggerConfig.error(
        `Error in old booking cancellation task: ${error.message}`
      );
    }
  });
};
module.exports = {
  scheduleOldBookingCancellation,
};
