const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/', notificationController.createNotification);
router.get('/user/:userId', notificationController.getUserNotifications);
router.get('/user/:userId/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/user/:userId/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
