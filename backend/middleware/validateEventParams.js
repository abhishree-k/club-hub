const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validateEventParams = require('../middleware/validateEventParams');

// Get all events
router.get('/', eventController.getAllEvents);

// Create a new event (admin only)
router.post('/', authMiddleware, adminMiddleware, eventController.createEvent);

// Register for an event using route param `:id`
// validateEventParams ensures `id` exists and is valid
router.post('/:id/register', authMiddleware, validateEventParams, eventController.registerForEvent);

module.exports = router;