const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClubSettings = sequelize.define('ClubSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  club: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  membershipType: {
    type: DataTypes.ENUM('public', 'invite-only', 'approval-required'),
    defaultValue: 'public',
    allowNull: false
  },

  applicationQuestions: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('applicationQuestions');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('applicationQuestions', JSON.stringify(value));
    }
  },

  maxMembers: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  approvalStages: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },

  allowSelfJoin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },

  requireApplication: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },

  membershipTiers: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('membershipTiers');
      return rawValue ? JSON.parse(rawValue) : [
        { name: 'Member', accessLevel: 1 },
        { name: 'Coordinator', accessLevel: 2 },
        { name: 'Admin', accessLevel: 3 }
      ];
    },
    set(value) {
      this.setDataValue('membershipTiers', JSON.stringify(value));
    }
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'club_settings',
  timestamps: true,
  indexes: [
    { fields: ['club'] },
    { fields: ['membershipType'] }
  ]
});

module.exports = ClubSettings;
