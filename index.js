const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const connectDB = require('./config/db');
const urlRoutes = require('./routes/urlRoutes');
const staticRoutes = require('./routes/staticRoutes');
const userRoutes = require('./routes/userRoutes');
const { handleURLRedirection } = require('./controllers/urlController');

//Middleware
app.use(express.json());
app.set('views', path.resolve("./views"));
app.set('view engine', 'ejs');
app.use("/", staticRoutes);
app.use(express.urlencoded({ extended: false}));
// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//Routes
app.use('/api', urlRoutes);
app.use('/user', userRoutes);
app.get('/:shortId', handleURLRedirection);