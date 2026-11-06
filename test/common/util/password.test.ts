import password from '../../../src/common/util/password';

describe('util.password', () => {
  it('should hash the password', () => {
    const plainPassword = 'password123';
    const hashedPassword = password.hash(plainPassword);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(plainPassword);
  });

  it('should check the password', () => {
    const plainPassword = 'password123';
    const hashedPassword = password.hash(plainPassword);
    const isMatch = password.check(plainPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should return false for incorrect password', () => {
    const plainPassword = 'password123';
    const incorrectPassword = 'wrongpassword';
    const hashedPassword = password.hash(plainPassword);
    const isMatch = password.check(incorrectPassword, hashedPassword);
    expect(isMatch).toBe(false);
  });
});
