const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  type: {
    type: DataTypes.ENUM('event', 'membership', 'discussion', 'admin', 'rsvp'),
    allowNull: false
  },

  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  eventId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  clubId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  actionUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['isRead'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Notification;
