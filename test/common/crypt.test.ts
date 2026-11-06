import '../../src/init/global.types';
import '../../src/init/global.pdg';
import crypt from '../../src/common/crypt';

describe('crypt', () => {
  it('should encrypt the plain text using the provided key', () => {
    const plainText = 'Hello, World!';
    const key = 'secretKey';
    const encryptedText = crypt.enc(plainText, key);
    expect(crypt.dec(encryptedText, key)).toBe(plainText);
  });
});
