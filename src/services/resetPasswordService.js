const dotenv = require('dotenv');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const User = require('../models/userModel');
const resetPasswordTokenModel = require('../models/resetPasswordTokenModel');

dotenv.config();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
sgMail.setApiKey(SENDGRID_API_KEY);

async function sendResetEmail(user) {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);

  const resetPasswordEntry = new resetPasswordTokenModel({
    userId: user._id,
    token: resetToken,
    expires: expires
  });

  try {
    await resetPasswordEntry.save();

    const msg = {
      to: user.email,
      from: 'jrabelo75@hotmail.com',
      subject: 'Password Reset',
      text: `Click on this link to reset your password: http://localhost:3000/reset/reset-password?token=${resetToken}`,
      html: `<strong>Click on this link to reset your password:</strong> <a href="http://localhost:3000/reset/reset-password?token=${resetToken}">Reset Password</a>`
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body)
    }
    return false;
  }
}

async function resetPassword(token, newPassword) {
  const tokenRecord = await resetPasswordTokenModel.findOne({ token: token });

  if (!tokenRecord) {
      return { success: false, message: "Invalid token" };
  }

  if (tokenRecord.expires < new Date()) {
      return { success: false, message: "Token has expired" };
  }

  try {
      await updatePassword(tokenRecord.userId, newPassword);
      await resetPasswordTokenModel.deleteOne({ token: token });

      return { success: true, message: "Password updated successfully" };
  } catch (error) {
      return { success: false, message: error.message };
  }
}

async function updatePassword(userId, newPassword) {
  const user = await User.findById(userId);
  if (!user) {
      throw new Error("User not found");
  }
  user.password = newPassword;
  await user.save();
  return user;
}

module.exports = {
  sendResetEmail,
  resetPassword,
  updatePassword
};
