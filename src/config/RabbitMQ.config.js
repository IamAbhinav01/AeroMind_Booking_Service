const amqplib = require('amqplib');
const { errorResponse } = require('../utils/responseFormatter');
const { StatusCodes } = require('http-status-codes');
const LoggerConfig = require('./logger.config');
const { ErrorHandler } = require('../errors');
const { RABBITMQ_SERVER_URL } = require('./server.config');

let channel, connection;
const connectRabitMQ = async () => {
  if (!RABBITMQ_SERVER_URL) {
    LoggerConfig.warn(
      'RABBITMQ_SERVER_URL is not configured. Skipping RabbitMQ setup.'
    );
    return false;
  }

  try {
    connection = await amqplib.connect(RABBITMQ_SERVER_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('aeromind-notifications');
    LoggerConfig.info('Connected to RabbitMQ ');
    return true;
  } catch (error) {
    LoggerConfig.error(`Error while connecting the RabitMQ : ${error.message}`);
    return false;
  }
};

const sendPayload = async (data) => {
  try {
    await channel.sendToQueue(
      'aeromind-notifications',
      Buffer.from(JSON.stringify(data))
    );
  } catch (error) {
    LoggerConfig.error(`Error while sending the Payload : ${error.message}`);
    return false;
  }
};

module.exports = { connectRabitMQ, sendPayload };
