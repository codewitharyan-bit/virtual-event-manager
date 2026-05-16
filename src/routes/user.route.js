const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', authMiddleware, userController.logoutUser);
router.post('/refresh-token', authMiddleware, userController.refreshToken);
router.post('/change-password', authMiddleware, userController.changePassword);

module.exports = router;