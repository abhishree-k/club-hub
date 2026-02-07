const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClubMembership = sequelize.define('ClubMembership', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.STRING, allowNull: false },
    club: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('Active', 'Pending', 'Inactive'), defaultValue: 'Active' }
});

module.exports = ClubMembership;
