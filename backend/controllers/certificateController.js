const { Certificate, Event, Registration } = require('../models');
const { Op } = require('sequelize');

// Generate a certificate for an attendee
exports.generateCertificate = async (req, res) => {
    try {
        const { studentId, eventName, attendeeName, attendeeEmail } = req.body;

        if (!studentId || !eventName || !attendeeName) {
            return res.status(400).json({ message: 'Student ID, event name, and attendee name are required' });
        }

        // Check if certificate already exists for this student + event
        const existing = await Certificate.findOne({
            where: { studentId, eventName, status: 'issued' }
        });

        if (existing) {
            return res.status(200).json({
                message: 'Certificate already exists',
                certificate: existing,
                alreadyExists: true
            });
        }

        // Look up event details
        const event = await Event.findOne({ where: { name: eventName } });
        const eventDate = event ? event.startDate : new Date().toISOString().split('T')[0];
        const clubName = event ? event.club : null;

        // Generate certificate ID
        const certificateId = await Certificate.generateCertificateId();

        // Create certificate record
        const certificate = await Certificate.create({
            certificateId,
            attendeeName,
            attendeeEmail: attendeeEmail || null,
            studentId,
            eventName,
            eventDate,
            clubName,
            eventId: event ? event.id : null,
            userId: req.userId || null,
            status: 'issued'
        });

        res.status(201).json({
            message: 'Certificate generated successfully',
            certificate
        });
    } catch (error) {
        console.error('Certificate Generation Error:', error);
        res.status(500).json({ message: 'Error generating certificate', error: error.message });
    }
};

// Get all certificates for a student
exports.getStudentCertificates = async (req, res) => {
    try {
        const { studentId } = req.params;

        const certificates = await Certificate.findAll({
            where: { studentId, status: 'issued' },
            order: [['issuedAt', 'DESC']]
        });

        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching certificates', error: error.message });
    }
};

// Verify a certificate by its unique ID
exports.verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findOne({
            where: { certificateId }
        });

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found', valid: false });
        }

        if (certificate.status === 'revoked') {
            return res.status(200).json({ message: 'Certificate has been revoked', valid: false, certificate });
        }

        res.json({ message: 'Certificate is valid', valid: true, certificate });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying certificate', error: error.message });
    }
};

// Track download
exports.trackDownload = async (req, res) => {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findOne({ where: { certificateId } });
        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        await certificate.increment('downloadCount');
        res.json({ message: 'Download tracked', downloadCount: certificate.downloadCount + 1 });
    } catch (error) {
        res.status(500).json({ message: 'Error tracking download', error: error.message });
    }
};

// Get all certificates (admin)
exports.getAllCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.findAll({
            order: [['issuedAt', 'DESC']]
        });
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching certificates', error: error.message });
    }
};

// Get available events for certificate generation
exports.getAvailableEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            order: [['startDate', 'DESC']]
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};
