const mongoose = require('mongoose');

const resetPasswordTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expires: {
    type: Date,
    required: true
  }
});

const ResetPasswordToken = mongoose.model('ResetPasswordToken', resetPasswordTokenSchema);

module.exports = ResetPasswordToken;
