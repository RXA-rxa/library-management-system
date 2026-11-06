const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { authenticate } = require('../middleware/auth');

router.post('/borrow', authenticate, borrowController.borrowBook);
router.post('/return', authenticate, borrowController.returnBook);
router.post('/renew', authenticate, borrowController.renewBook);
router.post('/lost', authenticate, borrowController.reportLost);
router.get('/records', authenticate, borrowController.getMyRecords);

module.exports = router;