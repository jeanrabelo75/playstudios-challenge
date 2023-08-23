const path = require('path');
const express = require('express');
const userService = require('../services/userService');

const router = express.Router();

router.route('/')
  .get((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'createUser.html'));
  })
  .post(async (req, res) => {
    try {
      const newUser = await userService.createUser(req.body);
      res.json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

module.exports = router;
