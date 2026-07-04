const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controller/userController');

router.post('/handles', authMiddleware, userController.saveHandles);
router.get('/cf-stats', authMiddleware, userController.getCFstatus)
router.get('/lc-stats', authMiddleware, userController.getLCStatus)
router.get('/cf-history', authMiddleware, userController.getCFRatingHistory);
router.get('/compare', authMiddleware, userController.compareUsers);
router.get('/weak-area', authMiddleware, userController.getWeakArea);
router.post('/friends/add', authMiddleware, userController.addFriend);
router.get('/friends', authMiddleware, userController.getFriends);
router.post('/friends/remove', authMiddleware, userController.removeFriend);
router.get('/lc-topics',authMiddleware,userController.getLCTopics)

module.exports = router;