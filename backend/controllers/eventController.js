const { Event, Registration } = require('../models');

exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const event = await Event.create(req.body);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
};

exports.registerForEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId || null;
        const { firstName, lastName, email, studentId, dietary, accessibility } = req.body;

        if (!firstName || !lastName || !email || !studentId) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }

        const registration = await Registration.create({
            EventId: id,
            UserId: userId,
            firstName,
            lastName,
            email,
            studentId,
            dietary,
            accessibility,
            status: 'registered'
        });

        res.status(201).json({ message: 'Registered successfully', registration });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Error registering', error: error.message });
    }
};
