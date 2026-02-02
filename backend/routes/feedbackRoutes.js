const express = require('express');
const router = express.Router();
const { Feedback } = require('../models');

// POST /api/feedback - Submit feedback
router.post('/', async (req, res) => {
    try {
        const { name, email, message, eventName, rating } = req.body;
        console.log('Received feedback:', req.body);
        if (!name || !message) {
            return res.status(400).json({ message: 'Name and message are required' });
        }
        await Feedback.create({ name, email, message, eventName, rating });
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Feedback Error:', error);
        res.status(500).json({ message: 'Error submitting feedback', error: error.message });
    }
});

module.exports = router;
