const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  club: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fileType: {
    type: DataTypes.ENUM('pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'image', 'video', 'other'),
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  version: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0'
  },
  parentResourceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'resources', key: 'id' }
  },
  accessLevel: {
    type: DataTypes.ENUM('public', 'members', 'admins'),
    defaultValue: 'members'
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'resources',
  timestamps: true,
  indexes: [
    { fields: ['club'] },
    { fields: ['uploadedBy'] },
    { fields: ['category'] },
    { fields: ['fileType'] },
    { fields: ['accessLevel'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Resource;
