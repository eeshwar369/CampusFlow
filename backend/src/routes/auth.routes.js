const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', authController.login.bind(authController));

// Protected routes
router.post('/logout', verifyToken, authController.logout.bind(authController));
router.get('/verify', verifyToken, authController.verify.bind(authController));
router.post('/refresh', verifyToken, authController.refresh.bind(authController));

module.exports = router;
