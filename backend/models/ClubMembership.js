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
      references: { model: 'Users', key: 'id' }, // FK → Users
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    club: {
      type: DataTypes.STRING,
      allowNull: false, // club name
    },

    status: {
      type: DataTypes.ENUM('Active', 'Pending', 'Inactive'),
      defaultValue: 'Active',
      allowNull: false, // membership status
    },

    deactivatedAt: {
      type: DataTypes.DATE,
      allowNull: true, // sets when the status becomes Inactive
    },
  },
  {
    timestamps: true,
    paranoid: true, // soft delete (adds deletedAt)
    indexes: [
      { unique: true, fields: ['studentId', 'club'] }, // prevent any duplicate memberships
      { fields: ['studentId'] },
      { fields: ['club'] },
      { fields: ['status'] },
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
