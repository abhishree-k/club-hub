const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');

router.post('/', pollController.createPoll);
router.get('/', pollController.getPolls);
router.get('/:id', pollController.getPollById);
router.post('/vote', pollController.vote);
router.get('/:id/results', pollController.getPollResults);
router.get('/user/:userId', pollController.getUserVotes);
router.put('/:id', pollController.updatePoll);
router.delete('/:id', pollController.deletePoll);
router.get('/:id/export', pollController.exportResults);

module.exports = router;
