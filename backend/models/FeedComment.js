const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeedComment = sequelize.define('FeedComment', {
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
  parentCommentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'feed_comments', key: 'id' }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'feed_comments',
  timestamps: true,
  indexes: [
    { fields: ['postId'] },
    { fields: ['userId'] },
    { fields: ['parentCommentId'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = FeedComment;
