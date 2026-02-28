const { Event, Registration } = require('../models');

// Fetch all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll(); // fetch all events
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const event = await Event.create(req.body); // create new event
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
};

// Register for an event using route param `:id`
// validateEventParams ensures `id` exists and is valid
exports.registerForEvent = async (req, res) => {
    try {
        const { id } = req.params; // event ID from route
        const userId = req.userId; // authenticated user ID
        const { firstName, lastName, email, studentId, dietary, accessibility } = req.body; // participant details

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' }); // ensure user is logged in
        }

        // Validate required fields
        if (!firstName || !lastName || !email || !studentId) {
            return res.status(400).json({ message: 'Required fields are missing' }); // basic validation
        }

        const event = await Event.findByPk(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' }); // validate event existence
        }

        // Check existing registration (as well as soft-deleted)
        const existing = await Registration.findOne({
            where: { userId, eventId: id },
            paranoid: false
        });

        if (existing && !existing.deletedAt) {
            return res.status(400).json({ message: 'Already registered for this event' }); // prevent duplicate active registration
        }

        if (existing && existing.deletedAt) {
            await existing.restore(); // restore the soft-deleted registration
            return res.status(200).json({ message: 'Registration restored', registration: existing });
        }

        // Create new registration records
        const registration = await Registration.create({
            userId,
            eventId: id,
            firstName,
            lastName,
            email,
            studentId,
            dietary,
            accessibility,
            status: 'registered', // default registration state
            paymentStatus: 'pending' // default payment state
        });

        res.status(201).json({ message: 'Registered successfully', registration });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Error registering', error: error.message });
    }
};
