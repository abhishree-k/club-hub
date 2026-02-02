const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, studentId, major, year, clubs } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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

        if (clubs && Array.isArray(clubs) && clubs.length > 0) {
            const { ClubMembership } = require('../models');
            const membershipPromises = clubs.map(club => {
                return ClubMembership.create({
                    UserId: user.id,
                    studentId: user.studentId,
                    club: club,
                    status: 'Active'
                });
            });
            await Promise.all(membershipPromises);
        }

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'User already exists (Email or Student ID is taken)' });
        }
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

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

exports.getMe = async (req, res) => {
    try {
        const { User, Registration, ClubMembership, Event } = require('../models');
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const registrations = await Registration.findAll({
            where: { UserId: user.id },
            include: [{ model: Event, attributes: ['name', 'startDate', 'startTime'] }]
        });

        const memberships = await ClubMembership.findAll({
            where: { UserId: user.id }
        });

        // Format data for frontend
        const formattedRegistrations = registrations.map(r => ({
            eventName: r.Event ? r.Event.name : 'Unknown Event',
            eventDate: r.Event ? r.Event.startDate : '',
            eventTime: r.Event ? r.Event.startTime : '', // Added time
            status: r.status
        }));

        const formattedMemberships = memberships.map(m => ({
            clubId: m.club,
            status: m.status
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
