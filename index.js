const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const userRoutes = require('./src/routes/userRoutes');
const loginRoutes = require('./src/routes/loginRoutes');
const errorHandler = require('./src/middlewares/errorHandler');
const resetPasswordRoutes = require('./src/routes/resetPasswordRoutes');
const ensureAuthenticated = require('./src/middlewares/ensureAuthenticated');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/playstudiosapi';
const SECRET_KEY = process.env.SECRET_KEY || '';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB successfully.');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false, 
  cookie: { secure: false }
}));

app.get('/', (req, res) => {
    res.send('PlayStudios Challenge');
});

// ROUTE 1 - CREATE USER
app.use('/users', userRoutes);

// ROUTE 2 - LOGIN
app.use('/login', loginRoutes);

app.get('/logged', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, './src/views/', 'logged.html'));
});

// ROUTE 3 - RESET PASSWORD
app.use('/reset', resetPasswordRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Challenge is listening on port ${PORT}`);
});
