const path = require('path');
const express = require('express');
const userService = require('../services/userService');
const resetPasswordService = require('../services/resetPasswordService');

const router = express.Router();

router.route('/reset-request')
  .get((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'resetRequest.html'));
  })
  .post(async (req, res) => {
    const { email } = req.body;
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const success = await resetPasswordService.sendResetEmail(user);

    if (success) {
      res.json({ message: 'Reset link sent to your email' });
    } else {
      res.status(500).json({ message: 'Error sending reset link' });
    }
  });

router.route('/reset-password')
  .get(async (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'resetPassword.html'));
  })
  .post(async (req, res) => {
    const { token, newPassword } = req.body;
    const result = await resetPasswordService.resetPassword(token, newPassword);

    if (result.success) {
        res.json({ message: result.message });
    } else {
        res.status(400).json({ message: result.message });
    }
});

module.exports = router;
