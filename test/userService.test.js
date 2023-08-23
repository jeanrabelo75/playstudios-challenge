const sinon = require('sinon');
const bcrypt = require('bcrypt');
const { expect } = require('chai');
const User = require('../src/models/userModel');
const userService = require('../src/services/userService');

describe('userService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createUser', () => {
    it('should throw an error if required fields are missing', async () => {
      const userData = { email: 'test@example.com' };

      try {
        await userService.createUser(userData);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).to.equal('All fields (email, password, fullName) are required');
        expect(error.statusCode).to.equal(400);
      }
    });

    it('should throw a duplicate error if email already in use', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'test123',
        fullName: 'Test User'
      };

      const mockMongoError = new Error('MongoServer error');
      mockMongoError.name = 'MongoServerError';
      mockMongoError.code = 11000;

      sinon.stub(User, 'create').throws(mockMongoError);

      try {
        await userService.createUser(userData);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).to.equal('Email already in use.');
        expect(error.statusCode).to.equal(409);
      }
    });

    it('should create and return a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'test123',
        fullName: 'Test User'
      };

      const mockUser = {
        ...userData,
        _id: 'mockUserId'
      };

      sinon.stub(User, 'create').resolves(mockUser);

      const newUser = await userService.createUser(userData);
      expect(newUser).to.deep.equal(mockUser);
    });
  });

  describe('validateUser', () => {
    it('should throw an error if no user is found with the provided email', async () => {
      const email = 'test@example.com';
      const password = 'test123';

      sinon.stub(User, 'findOne').resolves(null);

      try {
        await userService.validateUser(email, password);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).to.equal('No user found with this email.');
        expect(error.statusCode).to.equal(401);
      }
    });

    it('should throw an error if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'test123';
      const hashedPassword = await bcrypt.hash('correctPassword', 10);

      const mockUser = {
        email,
        password: hashedPassword
      };

      sinon.stub(User, 'findOne').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(false);

      try {
        await userService.validateUser(email, password);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).to.equal('Incorrect password.');
        expect(error.statusCode).to.equal(401);
      }
    });

    it('should return the user if validation is successful', async () => {
      const email = 'test@example.com';
      const password = 'test123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const mockUser = {
        email,
        password: hashedPassword
      };

      sinon.stub(User, 'findOne').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(true);

      const user = await userService.validateUser(email, password);
      expect(user.email).to.equal(email);
    });
  });

  describe('updatePassword', () => {
    it('should throw an error if the user is not found', async () => {
      const userId = 'mockUserId';
      const newPassword = 'newPassword123';

      sinon.stub(User, 'findById').resolves(null);

      try {
        await userService.updatePassword(userId, newPassword);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    it('should update password successfully', async () => {
      const userId = 'mockUserId';
      const newPassword = 'newPassword123';

      const mockUser = {
        _id: userId,
        password: '',
        save: sinon.fake.resolves(true)
      };

      sinon.stub(User, 'findById').resolves(mockUser);

      await userService.updatePassword(userId, newPassword);
      expect(mockUser.password).to.equal(newPassword);
    });
  });

  describe('getUserByEmail', () => {
    it('should throw an error if no user is found with the provided email', async () => {
      const email = 'test@example.com';

      sinon.stub(User, 'findOne').resolves(null);

      try {
        await userService.getUserByEmail(email);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).to.equal('No user found with this email.');
        expect(error.statusCode).to.equal(404);
      }
    });

    it('should return the user when found by email', async () => {
      const email = 'test@example.com';
      const mockUser = { email, _id: 'mockUserId' };

      sinon.stub(User, 'findOne').resolves(mockUser);

      const user = await userService.getUserByEmail(email);
      expect(user).to.deep.equal(mockUser);
    });
  });
});
