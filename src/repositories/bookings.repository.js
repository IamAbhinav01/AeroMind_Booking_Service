const CrudRepository = require('./crudOperations.repository');
const { Bookings } = require('../models');

class BookingRepository extends CrudRepository {
  constructor(Bookings) {
    super(Bookings);
  }
}
