const path = require('path');
const express = require('express');
const loginService = require('../services/loginService');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/', 'login.html'));
});

router.post('/', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ error: 'Email and password are required.' });
    }

    const user = await loginService.authenticate(email, password);

    if (!user) {
      return res.status(401).send({ error: 'Invalid email or password.' });
    }

    req.session.user = user;
    res.redirect('/logged');

  } catch (error) {
    next(error);
  }
});

module.exports = router;
