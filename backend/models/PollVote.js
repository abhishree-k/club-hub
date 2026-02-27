const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PollVote = sequelize.define('PollVote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pollId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'polls', key: 'id' }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Users', key: 'id' }
  },
  selectedOption: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  votedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'poll_votes',
  timestamps: true,
  indexes: [
    { fields: ['pollId'] },
    { fields: ['userId'] },
    { fields: ['votedAt'] }
  ]
});

module.exports = PollVote;
