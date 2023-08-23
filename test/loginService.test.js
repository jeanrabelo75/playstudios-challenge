const sinon = require('sinon');
const bcrypt = require('bcrypt');
const { expect } = require('chai');
const User = require('../src/models/userModel');
const loginService = require('../src/services/loginService');

describe('loginService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('authenticate', () => {
    it('should throw an error if user is not found', async () => {
      const email = 'test@example.com';
      const password = 'test123';

      sinon.stub(User, 'findOne').resolves(null);

      try {
        await loginService.authenticate(email, password);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).to.equal('User not found');
        expect(error.statusCode).to.equal(401);
      }
    });

    it('should throw an error if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'test123';
      const mockUser = { password: 'hashedPassword' };

      sinon.stub(User, 'findOne').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(false);

      try {
        await loginService.authenticate(email, password);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).to.equal('Incorrect password');
        expect(error.statusCode).to.equal(401);
      }
    });

    it('should return user data if authentication is successful', async () => {
      const email = 'test@example.com';
      const password = 'test123';
      const mockUser = { password: 'hashedPassword', email: email };

      sinon.stub(User, 'findOne').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(true);

      const result = await loginService.authenticate(email, password);
      expect(result).to.deep.equal(mockUser);
    });
  });
});
