const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { postSchema, commentSchema } = require('../validators/blogValidators');
const validateId = require('../middleware/validateId');
const blogOwnerMiddleware = require('../middleware/blogOwnerMiddleware');

// Validate route parameter
router.param('id', validateId);

router.get('/', blogController.getAllPosts);
router.get('/:id', blogController.getPostById);

router.post('/', authMiddleware, validate(postSchema), blogController.createPost);
router.post('/:id/comments', authMiddleware, validate(commentSchema), blogController.addComment);
router.post('/:id/like', authMiddleware, rateLimiter, blogController.likePost);
router.delete('/:id', authMiddleware, blogOwnerMiddleware, blogController.deletePost);

module.exports = router;
