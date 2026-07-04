const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const { connectRedis, redisClient } = require("./config/redis");
const urlRoutes = require("./routes/urlRoutes");
const staticRoutes = require("./routes/staticRoutes");
const userRoutes = require("./routes/userRoutes");
const { handleURLRedirection } = require("./controllers/urlController");
const { RedisStore } = require('connect-redis');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.resolve('./views'));
app.set('view engine', 'ejs');

const startServer = async () => {
    await connectDB();
    await connectRedis();

    const redisStore = new RedisStore({
        client: redisClient,
        prefix: "urlshortener:",
    });

    app.use(session({
        store: redisStore,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    }));

    app.use((req, res, next) => {
        res.locals.userId = req.session.userId || null;
        next();
    });
    
    // Routes AFTER session middleware
    app.use('/', staticRoutes);
    app.use('/api', urlRoutes);
    app.use('/user', userRoutes);
    app.get('/:shortId', handleURLRedirection);

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();