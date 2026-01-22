const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Registration = sequelize.define('Registration', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: DataTypes.ENUM('registered', 'cancelled'), defaultValue: 'registered' }
});

module.exports = Registration;
