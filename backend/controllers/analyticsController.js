const { Event, Registration, Feedback, ClubMembership, BlogPost } = require('../models');
const { Op } = require('sequelize');

const getOverviewStats = async (req, res) => {
  try {
    const totalMembers = await Registration.count();
    const upcomingEvents = await Event.count({
      where: {
        startDate: {
          [Op.gte]: new Date().toISOString().split('T')[0]
        }
      }
    });
    const newRegistrations = await Registration.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      totalMembers,
      upcomingEvents,
      newRegistrations,
      certificatesIssued: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventParticipationData = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{
        model: Registration,
        as: 'registrations'
      }],
      order: [['startDate', 'ASC']],
      limit: 10
    });

    const data = events.map(event => ({
      name: event.name,
      registrations: event.registrations ? event.registrations.length : 0
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveClubsData = async (req, res) => {
  try {
    const clubs = await ClubMembership.findAll({
      attributes: [
        'club',
        [ClubMembership.sequelize.fn('COUNT', ClubMembership.sequelize.col('id')), 'memberCount']
      ],
      group: ['club']
    });

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMonthlyEngagementData = async (req, res) => {
  try {
    const months = [];
    const registrations = [];
    const events = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      months.push(monthName);

      const regCount = await Registration.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      registrations.push(regCount);

      const eventCount = await Event.count({
        where: {
          startDate: {
            [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
          }
        }
      });
      events.push(eventCount);
    }

    res.json({ months, registrations, events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFeedbackAnalytics = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll();

    const total = feedbacks.length;
    const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / total || 0;

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    feedbacks.forEach(f => {
      ratingDistribution[f.rating]++;
    });

    res.json({
      total,
      averageRating: averageRating.toFixed(2),
      ratingDistribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMemberGrowthData = async (req, res) => {
  try {
    const months = [];
    const cumulative = [];

    let total = 0;
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      months.push(monthName);

      const count = await Registration.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      total += count;
      cumulative.push(total);
    }

    res.json({ months, cumulative });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClubWiseAnalytics = async (req, res) => {
  try {
    const clubs = ['tech', 'arts', 'debate', 'music', 'sports'];
    const clubData = {};

    for (const club of clubs) {
      const memberCount = await ClubMembership.count({
        where: { club }
      });

      const eventCount = await Event.count({
        where: { club }
      });

      const clubEvents = await Event.findAll({
        where: { club }
      });

      let totalRegistrations = 0;
      for (const event of clubEvents) {
        const eventRegs = await Registration.count({
          where: {
            club: club,
            eventId: event.id
          }
        });
        totalRegistrations += eventRegs;
      }

      clubData[club] = {
        memberCount,
        eventCount,
        totalRegistrations,
        avgRegistrationsPerEvent: eventCount > 0 ? (totalRegistrations / eventCount).toFixed(2) : 0
      };
    }

    res.json(clubData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExportData = async (req, res) => {
  try {
    const { type } = req.params;
    let data = [];
    let filename = '';

    switch (type) {
      case 'members':
        data = await Registration.findAll();
        filename = 'members-export.json';
        break;
      case 'events':
        data = await Event.findAll();
        filename = 'events-export.json';
        break;
      case 'feedbacks':
        data = await Feedback.findAll();
        filename = 'feedbacks-export.json';
        break;
      case 'clubs':
        data = await ClubMembership.findAll();
        filename = 'clubs-export.json';
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOverviewStats,
  getEventParticipationData,
  getActiveClubsData,
  getMonthlyEngagementData,
  getFeedbackAnalytics,
  getMemberGrowthData,
  getClubWiseAnalytics,
  getExportData
};
