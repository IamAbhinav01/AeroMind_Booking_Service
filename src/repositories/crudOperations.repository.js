const { StatusCodes } = require('http-status-codes');
const { LoggerConfig } = require('../config/');
const { ErrorHandler } = require('../errors');

class CrudRepository {
  constructor(model) {
    this.model = model;
  }
  async create(data) {
    try {
      const response = await this.model.create(data);
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
  async get(modelId) {
    try {
      const response = await this.model.findByPk(modelId);
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

  async update(modelId, data) {
    try {
      const response = await this.model.update(data, {
        where: {
          id: modelId,
        },
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

  async getAll() {
    try {
      const response = await this.model.findAll();
      LoggerConfig.info(
        `Successfully retrieved all data from the Database --> repository layer`
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

  async destroy(modelId) {
    try {
      const response = await this.model.destroy({
        where: {
          id: modelId,
        },
      });
      if (!response) {
        LoggerConfig.error(`Not able to delete the data with id ${modelId}`);
        throw new ErrorHandler(
          `Not able to delete the data with id ${modelId}`,
          StatusCodes.BAD_REQUEST
        );
      } else {
        LoggerConfig.info(`Successfully deleted the data with id ${modelId}`);
        return response;
      }
    } catch (error) {
      LoggerConfig.error(
        `Error occured while deleting the data with id ${modelId} ERROR:${error}`
      );
    }
  }
}

module.exports = CrudRepository;
