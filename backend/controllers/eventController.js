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
        const userId = req.userId;

        const existing = await Registration.findOne({ where: { EventId: id, UserId: userId } });
        if (existing) {
            return res.status(400).json({ message: 'Already registered' });
        }

        const registration = await Registration.create({
            EventId: id,
            UserId: userId,
            status: 'registered'
        });

        res.status(201).json({ message: 'Registered successfully', registration });
    } catch (error) {
        res.status(500).json({ message: 'Error registering', error: error.message });
    }
};
