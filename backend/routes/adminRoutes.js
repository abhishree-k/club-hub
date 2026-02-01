const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/registrations', authMiddleware, adminMiddleware, adminController.getRegistrations);
router.get('/club-memberships', authMiddleware, adminMiddleware, adminController.getClubMemberships);
router.get('/feedbacks', authMiddleware, adminMiddleware, adminController.getFeedbacks);

module.exports = router;
