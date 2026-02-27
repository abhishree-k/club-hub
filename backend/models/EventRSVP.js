const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventRSVP = sequelize.define('EventRSVP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Events', key: 'id' }
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },

  status: {
    type: DataTypes.ENUM('confirmed', 'waitlisted', 'cancelled', 'no-show'),
    defaultValue: 'confirmed',
    allowNull: false
  },

  rsvpedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  attended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },

  attendedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },

  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'event_rsvps',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['eventId', 'userId'] },
    { fields: ['eventId'] },
    { fields: ['userId'] },
    { fields: ['status'] }
  ]
});

module.exports = EventRSVP;
