const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

router.post('/', feedController.createPost);
router.get('/', feedController.getPosts);
router.get('/timeline', feedController.getActivityTimeline);
router.get('/:id', feedController.getPostById);
router.put('/:id', feedController.updatePost);
router.delete('/:id', feedController.deletePost);
router.post('/:id/reaction', feedController.reactToPost);
router.post('/:id/comments', feedController.commentOnPost);
router.get('/:id/comments', feedController.getComments);
router.put('/comments/:id', feedController.updateComment);
router.delete('/comments/:id', feedController.deleteComment);
router.patch('/:id/pin', feedController.pinPost);
router.patch('/:id/moderate', feedController.moderatePost);

module.exports = router;
