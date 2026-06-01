'use strict';
const { Model } = require('sequelize');
const { Enums } = require('../utils/common');
const { BookingStatus } = Enums;
module.exports = (sequelize, DataTypes) => {
  class Bookings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Bookings.init(
    {
      flightId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: [
          BookingStatus.INITIATED,
          BookingStatus.PENDING,
          BookingStatus.CANCEL,
          BookingStatus.CONFIRM,
        ],
        defaultValue: BookingStatus.INITIATED,
      },
      noOfSeats: { type: DataTypes.INTEGER, allowNull: false },
      totalCost: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Bookings',
    }
  );
  return Bookings;
};
