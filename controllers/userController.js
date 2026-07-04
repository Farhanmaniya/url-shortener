const User = require("../models/users");
const URL = require("../models/url");
const { v4: uuidv4 } = require("uuid");
const { setUser, getUser } = require("../service/auth");
const { resolveInclude } = require("ejs");
const bcrypt = require("bcryptjs");

const handleUserRegistration = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const newUser = await User.create({ username, email, password });
      req.session.userId = newUser._id;
      return res.redirect("/");
    } catch (error) {
      if (error.code === 11000) {
        return res.render('signup', { error: "Email already in use" });
      }
      console.log("Registration Error: ", error);
      return res.status(500).json({ message: "Internal Server Error" });

    }
  } catch (error) {
    console.log("Server Error: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleUserLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", { error: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", { error: "Invalid email or password" });
    }

    req.session.userId = user._id;
    return res.redirect("/");
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleUserLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    return res.redirect("/login");
  });
};

module.exports = {
  handleUserRegistration,
  handleUserLogin,
  handleUserLogout,
};
