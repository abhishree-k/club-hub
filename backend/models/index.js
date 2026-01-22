const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');
const Registration = require('./Registration');

// Associations
User.hasMany(Registration);
Registration.belongsTo(User);

Event.hasMany(Registration);
Registration.belongsTo(Event);

module.exports = { sequelize, User, Event, Registration };
