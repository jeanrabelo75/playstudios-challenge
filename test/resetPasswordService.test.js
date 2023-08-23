const chai = require('chai');
const sinon = require('sinon');
const sgMail = require('@sendgrid/mail');
const User = require('../src/models/userModel');
const chaiAsPromised = require('chai-as-promised');
const resetPasswordService = require('../src/services/resetPasswordService');
const resetPasswordTokenModel = require('../src/models/resetPasswordTokenModel');


chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Reset Password Service', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('sendResetEmail', function () {
    it('should send a reset email and return true on success', async function () {
      const mockUser = {
        _id: 'mockUserId',
        email: 'test@example.com'
      };

      sinon.stub(resetPasswordTokenModel.prototype, 'save').resolves();
      sinon.stub(sgMail, 'send').resolves();

      const result = await resetPasswordService.sendResetEmail(mockUser);
      expect(result).to.be.true;
    });

    it('should return false on failure', async function () {
      const mockUser = {
        _id: 'mockUserId',
        email: 'test@example.com'
      };

      sinon.stub(resetPasswordTokenModel.prototype, 'save').rejects(new Error('Mock error'));

      const result = await resetPasswordService.sendResetEmail(mockUser);
      expect(result).to.be.false;
    });
  });

  describe('resetPassword', function () {
    it('should reset password when token is valid', async function () {
      const mockToken = 'validToken';
      const newPassword = 'newPassword123';
      const mockUserId = 'mockUserIdString';
    
      const mockTokenData = {
        userId: mockUserId,
        token: mockToken,
        expires: new Date(new Date().getTime() + 100000)
      };

      sinon.stub(resetPasswordTokenModel, 'findOne').resolves(mockTokenData);
    
      const mockUser = {
        _id: mockUserId,
        password: '',
        save: sinon.stub().resolves(true)
      };

      sinon.stub(User, 'findById').resolves(mockUser);
      sinon.stub(resetPasswordTokenModel, 'deleteOne').resolves({ nRemoved: 1 });
    
      const result = await resetPasswordService.resetPassword(mockToken, newPassword);
    
      expect(result.success).to.be.true;
      expect(mockUser.password).to.equal(newPassword);
      expect(mockUser.save.calledOnce).to.be.true;
    });
    
    it('should reject reset when token is invalid', async function () {
      const mockToken = 'invalidToken';
      const newPassword = 'newPassword123';

      sinon.stub(resetPasswordTokenModel, 'findOne').resolves(null);

      const result = await resetPasswordService.resetPassword(mockToken, newPassword);
      expect(result.success).to.be.false;
    });

    it('should reject reset when token has expired', async function () {
      const mockToken = 'expiredToken';
      const newPassword = 'newPassword123';

      const mockTokenData = {
        userId: 'mockUserId',
        token: mockToken,
        expires: new Date(new Date().getTime() - 10000)
      };

      sinon.stub(resetPasswordTokenModel, 'findOne').resolves(mockTokenData);

      const result = await resetPasswordService.resetPassword(mockToken, newPassword);
      expect(result.success).to.be.false;
    });
  });

  describe('updatePassword', function () {
    it('should update user password', async function () {
      const mockUserId = 'mockUserId';
      const newPassword = 'newPassword123';

      const mockUser = {
        _id: mockUserId,
        password: 'oldPassword123',
        save: sinon.stub().resolves()
      };

      sinon.stub(User, 'findById').resolves(mockUser);

      await resetPasswordService.updatePassword(mockUserId, newPassword);
      expect(mockUser.password).to.equal(newPassword);
    });

    it('should throw an error if user is not found', async function () {
      const mockUserId = 'nonExistentUserId';
      const newPassword = 'newPassword123';

      sinon.stub(User, 'findById').resolves(null);

      await expect(resetPasswordService.updatePassword(mockUserId, newPassword)).to.be.rejectedWith(Error);
    });
  });
});
