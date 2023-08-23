const bcrypt = require('bcrypt');
const User = require('../models/userModel');

exports.createUser = async (userData) => {
  if (!userData.email || !userData.password || !userData.fullName) {
    const error = new Error("All fields (email, password, fullName) are required");
    error.statusCode = 400;
    throw error;
  }

  try {
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      const duplicateError = new Error('Email already in use.');
      duplicateError.statusCode = 409;
      throw duplicateError;
    } else {
      const unexpectedError = new Error('An unexpected error occurred while creating the user.');
      unexpectedError.statusCode = 500;
      throw unexpectedError;
    }
  }
};

exports.validateUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error('No user found with this email.');
        error.statusCode = 401;
        throw error;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        const error = new Error('Incorrect password.');
        error.statusCode = 401;
        throw error;
    }

    return user;
};

exports.updatePassword = async (userId, newPassword) => {
  try {
      const user = await User.findById(userId);
      
      if (!user) {
          throw new Error("User not found");
      }
      
      user.password = newPassword;
      await user.save();
  } catch (error) {
      console.error("Error updating password:", error);
      throw error;
  }
};

exports.getUserByEmail = async (email) => {
  try {
      const user = await User.findOne({ email });
      if (!user) {
          const error = new Error('No user found with this email.');
          error.statusCode = 404;
          throw error;
      }
      return user;
  } catch (error) {
      console.error('Error retrieving user by email:', error);
      throw error;
  }
};
