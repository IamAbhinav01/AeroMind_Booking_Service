'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('Bookings', [
      {
        flightId: 1,
        userId: 2,
        noOfSeats: 2,
        totalCost: 17000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        flightId: 2,
        userId: 1,
        noOfSeats: 4,
        totalCost: 48000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Bookings', null, {});
  },
};
