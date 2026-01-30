const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', eventController.getAllEvents);
router.post('/', authMiddleware, adminMiddleware, eventController.createEvent);
router.post('/:id/register', authMiddleware, eventController.registerForEvent);

module.exports = router;
