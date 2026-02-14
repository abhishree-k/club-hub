const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Registration = sequelize.define(
  'Registration',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }, // FK → Users
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Events', key: 'id' }, // FK → Events
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    status: {
      type: DataTypes.ENUM('registered', 'cancelled', 'completed'),
      defaultValue: 'registered',
      allowNull: false, // registration state
    },

    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false, // payment state
    },

    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true, // set when cancelled
    },
  },
  {
    timestamps: true,
    paranoid: true, // soft delete (adds deletedAt)
    indexes: [
      { unique: true, fields: ['userId', 'eventId'] }, // prevent duplicates
      { fields: ['userId'] },
      { fields: ['eventId'] },
      { fields: ['status'] },
      { fields: ['paymentStatus'] },
    ],
  }
);

// Auto-set cancellation time
Registration.addHook('beforeUpdate', (reg) => {
  if (reg.changed('status') && reg.status === 'cancelled') {
    reg.cancelledAt = new Date();
  }
});

module.exports = Registration;
