const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResourceDownload = sequelize.define('ResourceDownload', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'resources', key: 'id' }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  downloadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'resource_downloads',
  timestamps: true,
  indexes: [
    { fields: ['resourceId'] },
    { fields: ['userId'] },
    { fields: ['downloadedAt'] }
  ]
});

module.exports = ResourceDownload;
