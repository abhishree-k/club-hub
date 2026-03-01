const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidators');

router.post('/register', rateLimiter, validate(registerSchema), authController.register);
router.post('/login', rateLimiter, validate(loginSchema), authController.login);

router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
