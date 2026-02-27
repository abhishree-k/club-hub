const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');

router.post('/application', membershipController.createMembershipApplication);
router.get('/pending/:club', membershipController.getPendingApplications);
router.patch('/approve/:id', membershipController.approveApplication);
router.patch('/reject/:id', membershipController.rejectApplication);
router.get('/settings/:club', membershipController.getClubSettings);
router.patch('/settings/:club', membershipController.updateClubSettings);
router.post('/invite', membershipController.inviteMember);
router.patch('/tier/:id', membershipController.updateMembershipTier);
router.get('/user/:userId', membershipController.getUserMemberships);

module.exports = router;
