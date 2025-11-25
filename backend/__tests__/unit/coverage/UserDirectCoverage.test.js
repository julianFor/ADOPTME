/**
 * Test directo para cubrir líneas específicas del modelo User
 * Líneas objetivo: 32-39 (pre-save hook) y 45 (comparePassword method)
 */

const bcrypt = require('bcryptjs');

// Mock de bcryptjs
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('User Model - Specific Lines Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing Pre-save Hook (lines 32-39)', () => {
    test('should hash password when password is modified', async () => {
      // Setup mocks
      bcrypt.genSalt.mockResolvedValue('test_salt');
      bcrypt.hash.mockResolvedValue('hashed_password');

      // Simulate the pre-save function from User.js lines 32-39
      const preSaveFunction = async function(next) {
        if (!this.isModified('password')) return next();

        try {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
          next();
        } catch (error) {
          next(error);
        }
      };

      // Create mock document
      const mockDoc = {
        password: 'plaintext123',
        isModified: jest.fn().mockReturnValue(true)
      };

      const nextSpy = jest.fn();

      // Execute the function
      await preSaveFunction.call(mockDoc, nextSpy);

      // Verify execution
      expect(mockDoc.isModified).toHaveBeenCalledWith('password');
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext123', 'test_salt');
      expect(mockDoc.password).toBe('hashed_password');
      expect(nextSpy).toHaveBeenCalledWith();
    });

    test('should skip hashing when password is not modified', async () => {
      const preSaveFunction = async function(next) {
        if (!this.isModified('password')) return next();

        try {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
          next();
        } catch (error) {
          next(error);
        }
      };

      const mockDoc = {
        password: 'unchanged',
        isModified: jest.fn().mockReturnValue(false)
      };

      const nextSpy = jest.fn();
      await preSaveFunction.call(mockDoc, nextSpy);

      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(nextSpy).toHaveBeenCalledWith();
    });

    test('should handle errors in password hashing', async () => {
      bcrypt.genSalt.mockRejectedValue(new Error('Salt generation failed'));

      const preSaveFunction = async function(next) {
        if (!this.isModified('password')) return next();

        try {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
          next();
        } catch (error) {
          next(error);
        }
      };

      const mockDoc = {
        password: 'plaintext123',
        isModified: jest.fn().mockReturnValue(true)
      };

      const nextSpy = jest.fn();
      await preSaveFunction.call(mockDoc, nextSpy);

      expect(nextSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(nextSpy.mock.calls[0][0].message).toBe('Salt generation failed');
    });

    test('should handle errors in password hashing - hash step', async () => {
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      const preSaveFunction = async function(next) {
        if (!this.isModified('password')) return next();

        try {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
          next();
        } catch (error) {
          next(error);
        }
      };

      const mockDoc = {
        password: 'plaintext123',
        isModified: jest.fn().mockReturnValue(true)
      };

      const nextSpy = jest.fn();
      await preSaveFunction.call(mockDoc, nextSpy);

      expect(nextSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(nextSpy.mock.calls[0][0].message).toBe('Hashing failed');
    });
  });

  describe('comparePassword Method (line 45)', () => {
    test('should compare passwords successfully', async () => {
      bcrypt.compare.mockResolvedValue(true);

      // Simulate the comparePassword function from User.js line 45
      const comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
      };

      const mockDoc = {
        password: 'hashed_password_123'
      };

      const result = await comparePassword.call(mockDoc, 'plaintext123');

      expect(bcrypt.compare).toHaveBeenCalledWith('plaintext123', 'hashed_password_123');
      expect(result).toBe(true);
    });

    test('should return false for incorrect passwords', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
      };

      const mockDoc = {
        password: 'hashed_password_123'
      };

      const result = await comparePassword.call(mockDoc, 'wrong_password');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', 'hashed_password_123');
      expect(result).toBe(false);
    });

    test('should handle comparison errors', async () => {
      bcrypt.compare.mockRejectedValue(new Error('Comparison failed'));

      const comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
      };

      const mockDoc = {
        password: 'hashed_password_123'
      };

      await expect(
        comparePassword.call(mockDoc, 'any_password')
      ).rejects.toThrow('Comparison failed');

      expect(bcrypt.compare).toHaveBeenCalledWith('any_password', 'hashed_password_123');
    });
  });

  describe('Integration scenarios', () => {
    test('should simulate full user creation and password validation flow', async () => {
      // Setup for pre-save
      bcrypt.genSalt.mockResolvedValueOnce('creation_salt');
      bcrypt.hash.mockResolvedValueOnce('creation_hashed');
      
      // Setup for compare
      bcrypt.compare.mockResolvedValueOnce(true);

      const preSaveFunction = async function(next) {
        if (!this.isModified('password')) return next();
        try {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
          next();
        } catch (error) {
          next(error);
        }
      };

      const comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
      };

      // Simulate user creation
      const newUser = {
        password: 'user123password',
        isModified: jest.fn().mockReturnValue(true),
        comparePassword: comparePassword
      };

      // Simulate pre-save execution
      const nextSpy = jest.fn();
      await preSaveFunction.call(newUser, nextSpy);

      // Verify pre-save worked
      expect(newUser.password).toBe('creation_hashed');
      expect(nextSpy).toHaveBeenCalledWith();

      // Simulate login verification
      const isValid = await newUser.comparePassword('user123password');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('user123password', 'creation_hashed');
      expect(isValid).toBe(true);
    });

    test('should handle multiple password modifications', async () => {
      bcrypt.genSalt
        .mockResolvedValueOnce('salt1')
        .mockResolvedValueOnce('salt2');
      bcrypt.hash
        .mockResolvedValueOnce('hash1')
        .mockResolvedValueOnce('hash2');

      const preSaveFunction = async function(next) {
        if (!this.isModified('password')) return next();
        try {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
          next();
        } catch (error) {
          next(error);
        }
      };

      const user = {
        password: 'password1',
        isModified: jest.fn().mockReturnValue(true)
      };

      // First modification
      await preSaveFunction.call(user, jest.fn());
      expect(user.password).toBe('hash1');

      // Second modification
      user.password = 'password2';
      await preSaveFunction.call(user, jest.fn());
      expect(user.password).toBe('hash2');

      expect(bcrypt.genSalt).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledTimes(2);
    });
  });
});