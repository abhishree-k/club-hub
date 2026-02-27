const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeedPost = sequelize.define('FeedPost', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  club: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mediaType: {
    type: DataTypes.ENUM('image', 'video', 'mixed', 'text'),
    defaultValue: 'text'
  },
  mediaUrls: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  hashtags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  mentions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isModerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  moderationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved'
  }
}, {
  tableName: 'feed_posts',
  timestamps: true,
  indexes: [
    { fields: ['club'] },
    { fields: ['userId'] },
    { fields: ['isPinned'] },
    { fields: ['createdAt'] },
    { fields: ['moderationStatus'] }
  ]
});

module.exports = FeedPost;
