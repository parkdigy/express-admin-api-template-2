const REDACTED_LOG_VALUE = '[REDACTED]';

const SECURITY_KEY_SUFFIXES = ['password', 'passwd', 'pwd', 'token', 'authorization', 'cookie', 'secret', 'apikey'];
const PERSONAL_DATA_KEYS = new Set([
  'name',
  'fullname',
  'username',
  'nickname',
  'userid',
  'memberid',
  'customerid',
  'email',
  'emailaddress',
  'phone',
  'phonenumber',
  'mobile',
  'mobileno',
  'tel',
  'telno',
  'address',
  'zipcode',
  'ip',
  'ipaddress',
  'remoteipaddress',
  'latitude',
  'longitude',
  'personalno',
  'residentregistrationnumber',
  'ssn',
  'birth',
  'birthday',
  'dateofbirth',
  'cardnumber',
  'accountnumber',
  '비밀번호',
  '패스워드',
  '토큰',
  '인증',
  '쿠키',
  '이름',
  '성명',
  '닉네임',
  '사용자아이디',
  '회원아이디',
  '이메일',
  '전화번호',
  '휴대전화',
  '휴대폰',
  '주소',
  '주민등록번호',
  '생년월일',
  '계좌번호',
  '카드번호',
]);

const PERSONAL_DATA_KEY_PATTERN =
  /^(?:user|customer|member|recipient|sender|billing|shipping)?(?:name|nickname|email|emailaddress|phone|phonenumber|mobile|mobileno|tel|telno|address)$/;
const INLINE_SENSITIVE_VALUE_PATTERN =
  /((?:password|passwd|pwd|token|authorization|cookie|secret|api[_-]?key|email|phone|mobile|tel|address|personal[_-]?no|card[_-]?number|account[_-]?number)\s*["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^,\s;&]+)/gi;

export default {
  REDACTED_LOG_VALUE,

  isSensitiveLogKey(key: string) {
    const normalizedKey = normalizeKey(key);
    return (
      SECURITY_KEY_SUFFIXES.some((suffix) => normalizedKey.endsWith(suffix)) ||
      PERSONAL_DATA_KEYS.has(normalizedKey) ||
      PERSONAL_DATA_KEY_PATTERN.test(normalizedKey)
    );
  },
  sanitizeLogText(value: string, maxLength = 500) {
    const sanitized = value
      .replace(/(bearer\s+)[a-z0-9._~+/=-]+/gi, `$1${REDACTED_LOG_VALUE}`)
      .replace(INLINE_SENSITIVE_VALUE_PATTERN, (_match, prefix: string) => `${prefix}${REDACTED_LOG_VALUE}`);

    return sanitized.length > maxLength
      ? `${sanitized.substring(0, maxLength)}... (length: ${sanitized.length})`
      : sanitized;
  },

  /********************************************************************************************************************
   * sanitizeForLog
   * ******************************************************************************************************************/

  sanitizeForLog(value: unknown, maxStringLength = 500) {
    const seen = new WeakSet<object>();

    const sanitize = (currentValue: unknown, depth: number): unknown => {
      if (typeof currentValue === 'string') return this.sanitizeLogText(currentValue, maxStringLength);
      if (typeof currentValue === 'bigint') return currentValue.toString();
      if (currentValue == null || typeof currentValue === 'number' || typeof currentValue === 'boolean') {
        return currentValue;
      }
      if (Buffer.isBuffer(currentValue)) return `[Buffer: ${currentValue.length} bytes]`;
      if (currentValue instanceof Date) return currentValue.toISOString();
      if (typeof currentValue !== 'object') return currentValue.toString();
      if (depth >= 10) return '[MAX_DEPTH]';
      if (seen.has(currentValue)) return '[CIRCULAR]';

      seen.add(currentValue);
      if (Array.isArray(currentValue)) {
        return currentValue.map((item) => sanitize(item, depth + 1));
      }

      return Object.fromEntries(
        Object.entries(currentValue).map(([key, item]) => [
          key,
          this.isSensitiveLogKey(key) ? REDACTED_LOG_VALUE : sanitize(item, depth + 1),
        ])
      );
    };

    return sanitize(value, 0);
  },
};

/********************************************************************************************************************
 * normalizeKey
 * ******************************************************************************************************************/
function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
}
