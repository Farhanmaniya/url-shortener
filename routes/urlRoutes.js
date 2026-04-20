const express = require('express');
const router = express.Router();
const { handleURLShortening,
    handleGetAnalytics
} = require('../controllers/urlController');

router.post('/shorten', handleURLShortening);
router.get('/analytics/:shortId', handleGetAnalytics);

module.exports = router;