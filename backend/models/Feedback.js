const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define(
  'Feedback',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false, // required for feedback
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true, // optional
    },

    eventName: {
      type: DataTypes.STRING,
      allowNull: true, // optional, for event-specific feedback
    },

    rating: {
      type: DataTypes.ENUM('1', '2', '3', '4', '5'),
      allowNull: true, // optional numeric rating
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false, // feedback content
    },

    status: {
      type: DataTypes.ENUM('New', 'Read', 'Replied'),
      defaultValue: 'New',
      allowNull: false, // feedback workflow state
    },
  },
  {
    timestamps: true,
    paranoid: true, // soft delete
    indexes: [
      { fields: ['status'] },
      { fields: ['eventName'] },
      { fields: ['email'] },
    ],
  }
);

module.exports = Feedback;
