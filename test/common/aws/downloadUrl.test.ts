import axios from 'axios';
import {
  downloadDataFromUrl,
  isPublicIpAddress,
  parseDownloadUrl,
  URL_DOWNLOAD_MAX_BYTES,
  URL_DOWNLOAD_MAX_REDIRECTS,
  URL_DOWNLOAD_TIMEOUT_MS,
} from '../../../src/common/aws/awsS3/downloadDataFromUrl';

describe('S3 URL download security', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseDownloadUrl', () => {
    it.each(['https://example.com/image.jpg', 'http://example.com/image.jpg'])('allows HTTP(S): %s', (url) => {
      expect(parseDownloadUrl(url).toString()).toBe(url);
    });

    it.each(['file:///etc/passwd', 'ftp://example.com/image.jpg', 'data:text/plain,test'])(
      'blocks protocol: %s',
      (url) => {
        expect(() => parseDownloadUrl(url)).toThrow('HTTP 또는 HTTPS URL만 사용할 수 있습니다.');
      }
    );

    it('blocks credentials in URL', () => {
      expect(() => parseDownloadUrl('https://user:password@example.com/image.jpg')).toThrow(
        '인증 정보가 포함된 URL은 사용할 수 없습니다.'
      );
    });

    it.each(['http://127.0.0.1/image.jpg', 'http://[::1]/image.jpg', 'http://[::ffff:7f00:1]/image.jpg'])(
      'blocks an IP literal for a non-public destination: %s',
      (url) => {
        expect(() => parseDownloadUrl(url)).toThrow('사설망 또는 예약된 IP 주소에는 접근할 수 없습니다.');
      }
    );
  });

  describe('isPublicIpAddress', () => {
    it.each([
      '0.0.0.0',
      '10.0.0.1',
      '100.64.0.1',
      '127.0.0.1',
      '169.254.169.254',
      '172.16.0.1',
      '192.168.0.1',
      '224.0.0.1',
      '::',
      '::1',
      '::ffff:127.0.0.1',
      'fc00::1',
      'fe80::1',
    ])('blocks non-public address: %s', (address) => {
      expect(isPublicIpAddress(address)).toBe(false);
    });

    it.each(['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111'])('allows public address: %s', (address) => {
      expect(isPublicIpAddress(address)).toBe(true);
    });
  });

  describe('downloadUrl', () => {
    it('applies download resource limits and bypasses environment proxies', async () => {
      const data = Buffer.from('image');
      const get = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data });

      await expect(downloadDataFromUrl('https://example.com/image.jpg')).resolves.toEqual(data);
      expect(get).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        expect.objectContaining({
          responseType: 'arraybuffer',
          timeout: URL_DOWNLOAD_TIMEOUT_MS,
          maxContentLength: URL_DOWNLOAD_MAX_BYTES,
          maxBodyLength: URL_DOWNLOAD_MAX_BYTES,
          maxRedirects: URL_DOWNLOAD_MAX_REDIRECTS,
          proxy: false,
          httpAgent: expect.anything(),
          httpsAgent: expect.anything(),
          beforeRedirect: expect.any(Function),
        })
      );
    });

    it('blocks a loopback destination before connecting', async () => {
      await expect(downloadDataFromUrl('http://127.0.0.1:1/image.jpg')).rejects.toThrow(
        '사설망 또는 예약된 IP 주소에는 접근할 수 없습니다.'
      );
    });

    it('blocks a hostname that resolves to a loopback address', async () => {
      await expect(downloadDataFromUrl('http://localhost:1/image.jpg')).rejects.toThrow(
        '사설망 또는 예약된 IP 주소에는 접근할 수 없습니다.'
      );
    });

    it('blocks redirects to unsupported protocols', async () => {
      const data = Buffer.from('image');
      const get = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data });

      await downloadDataFromUrl('https://example.com/image.jpg');
      const requestConfig = get.mock.calls[0][1];

      expect(() => requestConfig?.beforeRedirect?.({ protocol: 'file:' }, {} as never, {} as never)).toThrow(
        'HTTP 또는 HTTPS 리다이렉트만 사용할 수 있습니다.'
      );
    });
  });
});
