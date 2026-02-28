const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClubFile = sequelize.define('ClubFile', {
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

  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false
  },

  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: false
  },

  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  fileType: {
    type: DataTypes.ENUM('document', 'image', 'video', 'audio', 'archive', 'other'),
    allowNull: false
  },

  folder: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },

  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'club_files',
  timestamps: true,
  indexes: [
    { fields: ['club'] },
    { fields: ['uploadedBy'] },
    { fields: ['folder'] },
    { fields: ['fileType'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = ClubFile;
