const express = require('express');
const router = express.Router();
const multer = require('multer');
const analyzeController = require('../controllers/analyzeController');

// Configure Multer (Store in memory, don't save to disk)
const upload = multer({ storage: multer.memoryStorage() });

// Update route to accept Text OR Image
router.post('/verify', upload.single('image'), analyzeController.verifyRumor);

router.get('/recent', analyzeController.getRecentChecks);

module.exports = router;