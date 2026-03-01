const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// Public: Verify a certificate
router.get('/verify/:certificateId', certificateController.verifyCertificate);

// Public: Get available events for certificate dropdown
router.get('/events', certificateController.getAvailableEvents);

// Public: Generate a certificate (no auth required for demo)
router.post('/generate', certificateController.generateCertificate);

// Public: Get certificates for a student by student ID
router.get('/student/:studentId', certificateController.getStudentCertificates);

// Public: Track download
router.post('/download/:certificateId', certificateController.trackDownload);

// Admin: Get all certificates
router.get('/', certificateController.getAllCertificates);

module.exports = router;
