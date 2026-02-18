const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

const protect = require('../middleware/authMiddleware'); 

router.post('/add', protect, chatController.askAI);
router.get('/history/:patientId', protect, chatController.getChatHistory);

module.exports = router;