const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 150]
    }
  },

  club: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true }
  },

  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },

  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },

  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  tableName: 'events',
  timestamps: true,
  indexes: [
    { fields: ['startDate'] },
    { fields: ['club'] }
  ]
});

// ---------- Hooks ----------

Event.beforeValidate((event) => {
  if (event.startDate && event.endDate) {
    if (new Date(event.endDate) < new Date(event.startDate)) {
      throw new Error('End date cannot be before start date');
    }
  }
  if (
    event.startDate === event.endDate &&
    event.startTime &&
    event.endTime &&
    event.endTime <= event.startTime
  ) {
    throw new Error('End time must be after start time');
  }
});

// ---------- Static query helpers ----------

Event.findUpcoming = function () {
  return this.findAll({
    where: {
      startDate: {
        [Op.gte]: new Date().toISOString().split('T')[0]
      }
    },
    order: [['startDate', 'ASC'], ['startTime', 'ASC']]
  });
};

Event.findByClub = function (clubName) {
  return this.findAll({
    where: { club: clubName }
  });
};

Event.findOngoing = function () {
  const today = new Date().toISOString().split('T')[0];
  return this.findAll({
    where: {
      startDate: { [Op.lte]: today },
      endDate: { [Op.gte]: today }
    }
  });
};

module.exports = Event;
