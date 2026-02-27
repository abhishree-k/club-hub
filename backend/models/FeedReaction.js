const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeedReaction = sequelize.define('FeedReaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'feed_posts', key: 'id' }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  reactionType: {
    type: DataTypes.ENUM('like', 'love', 'laugh', 'wow', 'sad', 'angry'),
    allowNull: false,
    defaultValue: 'like'
  }
}, {
  tableName: 'feed_reactions',
  timestamps: true,
  indexes: [
    { fields: ['postId'] },
    { fields: ['userId'] },
    { fields: ['reactionType'] }
  ]
});

module.exports = FeedReaction;
