const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// -------------------------
// User Registration
// -------------------------
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, studentId, major, year, clubs } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            studentId,
            major,
            year,
            role: 'student'
        });

        // Create club memberships if provided
        if (clubs && Array.isArray(clubs) && clubs.length > 0) {
            const { ClubMembership } = require('../models');
            const membershipPromises = clubs.map(club => {
                return ClubMembership.create({
                    UserId: user.id,          // link to User
                    studentId: user.studentId, 
                    club: club,
                    status: 'Active'          // membership state
                });
            });
            await Promise.all(membershipPromises);
        }

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        // Handle unique constraint violations
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'User already exists (Email or Student ID is taken)' });
        }
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// -------------------------
// User Login
// -------------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        // Validate credentials
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const userData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            studentId: user.studentId,
            role: user.role,
            major: user.major,
            year: user.year
        };

        res.json({ token, user: userData });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// -------------------------
// Get Authenticated User Info
// -------------------------
exports.getMe = async (req, res) => {
    try {
        const { User, Registration, ClubMembership, Event } = require('../models');

        // Fetch user
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch user's registrations
        const registrations = await Registration.findAll({
            where: { UserId: user.id },
            include: [{ model: Event, attributes: ['name', 'startDate', 'startTime'] }]
        });

        // Fetch user's club memberships
        const memberships = await ClubMembership.findAll({
            where: { UserId: user.id }
        });

        // Format registrations for frontend
        const formattedRegistrations = registrations.map(r => ({
            eventName: r.Event ? r.Event.name : 'Unknown Event',
            eventDate: r.Event ? r.Event.startDate : '',
            eventTime: r.Event ? r.Event.startTime : '',
            status: r.status,
            paymentStatus: r.paymentStatus,
            cancelledAt: r.cancelledAt
        }));

        // Format memberships for frontend
        const formattedMemberships = memberships.map(m => ({
            club: m.club,
            status: m.status,
            deactivatedAt: m.deactivatedAt
        }));

        res.json({
            user,
            registrations: formattedRegistrations,
            memberships: formattedMemberships
        });
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
};
