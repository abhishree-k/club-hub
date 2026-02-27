const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// -------------------------
// Public Routes
// -------------------------

// Get all events
router.get('/', eventController.getAllEvents);

// -------------------------
// Admin Routes
// -------------------------

// Create a new event (admin only)
router.post('/', authMiddleware, adminMiddleware, eventController.createEvent);

// -------------------------
// Authenticated User Routes
// -------------------------

// Register for an event (user must be logged in)
router.post('/:id/register', authMiddleware, eventController.registerForEvent);

module.exports = router;
