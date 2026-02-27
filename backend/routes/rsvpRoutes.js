const express = require('express');
const router = express.Router();
const rsvpController = require('../controllers/rsvpController');

router.post('/', rsvpController.createRSVP);
router.get('/event/:eventId', rsvpController.getEventRSVPs);
router.get('/user/:userId', rsvpController.getUserRSVPs);
router.patch('/:id', rsvpController.updateRSVPStatus);
router.patch('/:id/cancel', rsvpController.cancelRSVP);
router.patch('/:id/attend', rsvpController.markAttendance);
router.get('/event/:eventId/report', rsvpController.getEventAttendanceReport);

module.exports = router;
