const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MembershipFee = sequelize.define('MembershipFee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  club: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  paymentMethod: {
    type: DataTypes.ENUM('stripe', 'paypal', 'cash', 'other'),
    allowNull: false,
    defaultValue: 'stripe'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  academicYear: {
    type: DataTypes.STRING(9),
    allowNull: true
  }
}, {
  tableName: 'membership_fees',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['club'] },
    { fields: ['status'] },
    { fields: ['academicYear'] }
  ]
});

module.exports = MembershipFee;
