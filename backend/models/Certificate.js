const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certificate = sequelize.define('Certificate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    certificateId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        // Auto-generated unique certificate ID like "CERT-2026-0001"
    },

    attendeeName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true }
    },

    attendeeEmail: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: { isEmail: true }
    },

    studentId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { notEmpty: true }
    },

    eventName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true }
    },

    eventDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    clubName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    eventId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'events', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    },

    issuedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    status: {
        type: DataTypes.STRING,
        defaultValue: 'issued',
        allowNull: false,
        validate: {
            isIn: [['issued', 'revoked', 'expired']]
        }
    },

    downloadCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }

}, {
    tableName: 'certificates',
    timestamps: true,
    indexes: [
        { fields: ['certificateId'], unique: true },
        { fields: ['studentId'] },
        { fields: ['eventId'] },
        { fields: ['attendeeEmail'] },
        { fields: ['status'] }
    ]
});

// Generate unique certificate ID
Certificate.generateCertificateId = async function () {
    const year = new Date().getFullYear();
    const lastCert = await this.findOne({
        where: { certificateId: { [require('sequelize').Op.like]: `CERT-${year}-%` } },
        order: [['id', 'DESC']]
    });

    let nextNum = 1;
    if (lastCert) {
        const parts = lastCert.certificateId.split('-');
        nextNum = parseInt(parts[2], 10) + 1;
    }

    return `CERT-${year}-${String(nextNum).padStart(4, '0')}`;
};

module.exports = Certificate;
