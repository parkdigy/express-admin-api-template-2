import '../../src/init/global.types';
import '../../src/init/global.pdg';
import aes256 from '../../src/common/aes256';
import { Buffer } from 'buffer';

describe('aes256', () => {
  const key = 'mySecretKey';
  const inputString = 'Hello, World!';
  const inputBuffer = Buffer.from(inputString);

  it('should encrypt and decrypt a string', () => {
    const encrypted = aes256.encrypt(key, inputString);
    const decrypted = aes256.decrypt(key, encrypted);

    expect(decrypted).toBe(inputString);
  });

  it('should encrypt and decrypt a buffer', () => {
    const encrypted = aes256.encrypt(key, inputBuffer);
    const decrypted = aes256.decrypt(key, encrypted);

    expect(decrypted).toEqual(inputBuffer);
  });

  it('should throw an error when key is empty', () => {
    expect(() => {
      aes256.encrypt('', inputString);
    }).toThrow('Provided "key" must be a non-empty string');

    expect(() => {
      aes256.decrypt('', inputString);
    }).toThrow('Provided "key" must be a non-empty string');
  });

  it('should throw an error when input is empty', () => {
    expect(() => {
      aes256.encrypt(key, '');
    }).toThrow('Provided "input" must be a non-empty string or buffer');

    expect(() => {
      aes256.decrypt(key, '');
    }).toThrow('Provided "encrypted" must be a non-empty string or buffer');
  });

  it('should throw an error when encrypted value is invalid', () => {
    expect(() => {
      aes256.decrypt(key, 'invalid');
    }).toThrow('Provided "encrypted" must decrypt to a non-empty string or buffer');
  });
});
