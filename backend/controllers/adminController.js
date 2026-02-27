const { User, ClubMembership, Feedback } = require('../models');

// Fetch all student registrations
exports.getRegistrations = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { role: 'student' },
            include: [{ model: ClubMembership }], // Include club memberships
            order: [['createdAt', 'DESC']]
        });

        // Format data for frontend
        const formatted = users.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            studentId: user.studentId,
            clubs: user.ClubMemberships ? user.ClubMemberships.map(cm => cm.club) : [],
            registeredAt: user.createdAt
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Error fetching registrations:", error);
        res.status(500).json({ message: 'Error fetching registrations', error: error.message });
    }
};

// Fetch all club memberships
exports.getClubMemberships = async (req, res) => {
    try {
        const memberships = await ClubMembership.findAll({
            include: [{ model: User, attributes: ['firstName', 'lastName'] }], // Include user info
            order: [['createdAt', 'DESC']]
        });

        const formatted = memberships.map(m => ({
            id: m.id,
            name: m.User ? `${m.User.firstName} ${m.User.lastName}` : 'Unknown',
            studentId: m.studentId,
            club: m.club,
            status: m.status
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Error fetching club memberships:", error);
        res.status(500).json({ message: 'Error fetching club memberships', error: error.message });
    }
};

// Fetch all feedbacks
exports.getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        res.status(500).json({ message: 'Error fetching feedbacks', error: error.message });
    }
};
