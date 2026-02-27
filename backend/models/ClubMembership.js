const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClubMembership = sequelize.define(
  'ClubMembership',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    club: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('Active', 'Pending', 'Inactive', 'Rejected'),
      defaultValue: 'Pending',
      allowNull: false,
    },

    membershipType: {
      type: DataTypes.ENUM('Member', 'Coordinator', 'Admin'),
      defaultValue: 'Member',
      allowNull: false,
    },

    accessLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },

    applicationAnswers: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    approvalStage: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },

    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },

    approvalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    deactivatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    joinedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    indexes: [
      { unique: true, fields: ['studentId', 'club'] },
      { fields: ['studentId'] },
      { fields: ['club'] },
      { fields: ['status'] },
      { fields: ['membershipType'] },
      { fields: ['accessLevel'] },
    ],
  }
);

// Auto-set deactivation time
ClubMembership.addHook('beforeUpdate', (membership) => {
  if (membership.changed('status') && membership.status === 'Inactive') {
    membership.deactivatedAt = new Date();
  }
});

module.exports = ClubMembership;
