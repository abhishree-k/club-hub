const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  donorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Users', key: 'id' }
  },
  club: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  paymentMethod: {
    type: DataTypes.ENUM('stripe', 'paypal', 'cash', 'other'),
    allowNull: false,
    defaultValue: 'stripe'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  donationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  campaign: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'donations',
  timestamps: true,
  indexes: [
    { fields: ['donorId'] },
    { fields: ['club'] },
    { fields: ['status'] },
    { fields: ['donationDate'] },
    { fields: ['campaign'] }
  ]
});

module.exports = Donation;
