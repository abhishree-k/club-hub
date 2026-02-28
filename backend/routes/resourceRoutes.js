const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

router.post('/', resourceController.uploadResource);
router.get('/', resourceController.getResources);
router.get('/search', resourceController.searchResources);
router.get('/:id', resourceController.getResourceById);
router.put('/:id', resourceController.updateResource);
router.delete('/:id', resourceController.deleteResource);
router.post('/:id/download', resourceController.downloadResource);
router.get('/downloads/list', resourceController.getDownloads);
router.get('/downloads/stats', resourceController.getDownloadStats);
router.patch('/:id/pin', resourceController.pinResource);

module.exports = router;
