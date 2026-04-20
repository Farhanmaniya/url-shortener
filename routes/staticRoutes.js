const express = require('express');
const router = express.Router();
const URL = require('../models/url');   

router.get('/', async (req, res) => {
    const allUrls = await URL.find({});
    return res.render('home', { urls: allUrls });
});

router.get('/signup', (req, res) => {
    res.render("signup");
});

router.get('/login', (req, res) => {
    res.render("login");
});

module.exports = router;