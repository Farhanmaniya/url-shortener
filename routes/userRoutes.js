const express = require('express');
const router = express.Router();
const {
    handleUserRegistration,
    handleUserLogin,
    handleUserLogout,
}  = require('../controllers/userController');


router.post('/signup', handleUserRegistration);
router.post('/login', handleUserLogin); 
router.post('/logout', handleUserLogout);

module.exports = router;