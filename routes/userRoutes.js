const express = require('express');
const router = express.Router();
const {
    handleUserRegistration,
    handleUserLogin
}  = require('../controllers/userController');


router.post('/signup', handleUserRegistration);
router.post('/login', handleUserLogin); 

module.exports = router;