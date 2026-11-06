import sanitize from '../../../src/common/util/sanitize';
import '../../../src/init/global.pdg';

describe('sanitizeLog', () => {
  it('recursively redacts credentials and personal data without mutating the source', () => {
    const source = {
      user: {
        email: 'user@example.com',
        Password: 'plain-password',
        profile: [{ phone_number: '01012345678', nickname: 'visible' }],
      },
      headers: {
        Authorization: 'Bearer access-token',
        Cookie: 'session=secret',
      },
      api_key: 'api-secret',
      status: 'active',
    };

    expect(sanitize.sanitizeForLog(source)).toEqual({
      user: {
        email: sanitize.REDACTED_LOG_VALUE,
        Password: sanitize.REDACTED_LOG_VALUE,
        profile: [{ phone_number: sanitize.REDACTED_LOG_VALUE, nickname: sanitize.REDACTED_LOG_VALUE }],
      },
      headers: {
        Authorization: sanitize.REDACTED_LOG_VALUE,
        Cookie: sanitize.REDACTED_LOG_VALUE,
      },
      api_key: sanitize.REDACTED_LOG_VALUE,
      status: 'active',
    });
    expect(source.user.Password).toBe('plain-password');
  });

  it('handles circular references, buffers and deeply nested values safely', () => {
    const source: Record<string, unknown> = { file: Buffer.from('secret') };
    source.self = source;

    expect(sanitize.sanitizeForLog(source)).toEqual({
      file: '[Buffer: 6 bytes]',
      self: '[CIRCULAR]',
    });
  });

  it('redacts inline credentials from error text', () => {
    const text = 'request failed password=plain authorization=Bearer abc.def email=user@example.com';
    const sanitized = sanitize.sanitizeLogText(text, 1000);

    expect(sanitized).not.toContain('plain');
    expect(sanitized).not.toContain('abc.def');
    expect(sanitized).not.toContain('user@example.com');
    expect(sanitized).toContain(sanitize.REDACTED_LOG_VALUE);
  });
});
