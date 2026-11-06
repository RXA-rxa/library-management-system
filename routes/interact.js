const express = require('express');
const router = express.Router();
const interactController = require('../controllers/interactController');
const { authenticate } = require('../middleware/auth');

router.post('/like', authenticate, interactController.toggleLike);
router.post('/fav', authenticate, interactController.toggleFav);
router.post('/comment', authenticate, interactController.addComment);
router.get('/comments/:bookId', interactController.getComments);

module.exports = router;