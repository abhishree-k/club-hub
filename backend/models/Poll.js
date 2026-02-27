const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Poll = sequelize.define('Poll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  club: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  allowMultipleChoice: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  totalVotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'polls',
  timestamps: true,
  indexes: [
    { fields: ['club'] },
    { fields: ['createdBy'] },
    { fields: ['isActive'] },
    { fields: ['deadline'] }
  ]
});

module.exports = Poll;
