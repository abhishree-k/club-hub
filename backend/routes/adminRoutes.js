const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Apply authentication and admin authorization to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/registrations', adminController.getRegistrations);
router.get('/club-memberships', adminController.getClubMemberships);
router.get('/feedbacks', adminController.getFeedbacks);

module.exports = router;
