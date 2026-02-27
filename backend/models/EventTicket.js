const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventTicket = sequelize.define('EventTicket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'events', key: 'id' }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  ticketType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  pricePerTicket: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  totalAmount: {
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
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  qrCode: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'event_tickets',
  timestamps: true,
  indexes: [
    { fields: ['eventId'] },
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['purchaseDate'] }
  ]
});

module.exports = EventTicket;
