const User = require('../models/users');
const URL = require('../models/url');
const {v4: uuidv4} = require('uuid');
const {setUser, getUser} = require('../service/auth');
const { resolveInclude } = require('ejs');

const handleUserRegistration = async (req, res) => {
    const {username, email, password} = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    await User.create({
        username: username,
        email: email,
        password: password
    });
    return res.redirect("/");
}

const handleUserLogin = async (req, res) => {
    const { email, password} = req.body;
    const user = await User.findOne({
        email: email,
        password: password
    });
    if(!user) {
        res.render("login", {
            error: "Invalid email or password"
        })
    }

    const sessionId = uuidv4();
    setUser(sessionId, user);
    res.cookie("uid", sessionId);
    console.log("User Logged in:", user);
    // console.log("Session ID:", sessionId);
    console.log("Cookie set with uid:", sessionId);
    return res.redirect("/");
};

module.exports = {
    handleUserRegistration,
    handleUserLogin
}