const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', blogController.getAllPosts);
router.get('/:id', blogController.getPostById);
router.post('/', authMiddleware, blogController.createPost);
router.post('/:id/comments', authMiddleware, blogController.addComment);
router.post('/:id/like', authMiddleware, blogController.likePost);
router.delete('/:id', authMiddleware, blogController.deletePost);

module.exports = router;
