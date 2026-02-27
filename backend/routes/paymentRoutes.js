const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/membership', paymentController.processMembershipFee);
router.get('/membership', paymentController.getMembershipFees);
router.get('/membership/user/:userId', paymentController.getUserMembershipFees);

router.post('/tickets', paymentController.purchaseEventTicket);
router.get('/tickets', paymentController.getEventTickets);
router.get('/tickets/user/:userId', paymentController.getUserTickets);

router.post('/donations', paymentController.makeDonation);
router.get('/donations', paymentController.getDonations);

router.get('/report', paymentController.getPaymentReport);

router.post('/refund/:type/:id', paymentController.refundPayment);

module.exports = router;
