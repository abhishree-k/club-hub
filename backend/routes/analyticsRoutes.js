const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', analyticsController.getOverviewStats);
router.get('/event-participation', analyticsController.getEventParticipationData);
router.get('/active-clubs', analyticsController.getActiveClubsData);
router.get('/monthly-engagement', analyticsController.getMonthlyEngagementData);
router.get('/feedback', analyticsController.getFeedbackAnalytics);
router.get('/member-growth', analyticsController.getMemberGrowthData);
router.get('/club-wise', analyticsController.getClubWiseAnalytics);
router.get('/export/:type', analyticsController.getExportData);

module.exports = router;
