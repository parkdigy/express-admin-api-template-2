import axios from 'axios';
import ip from '../../../src/common/util/ip';

jest.mock('axios');

describe('util.ip', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined if IP starts with 127.', async () => {
    const result = await ip.info('127.0.0.1');
    expect(result).toBeUndefined();
  });

  it('should return undefined if IP starts with 192.', async () => {
    const result = await ip.info('192.168.0.1');
    expect(result).toBeUndefined();
  });

  it('should return IP info if IP is valid', async () => {
    const mockData = {
      status: 'success',
      country: 'United States',
      region: 'California',
      city: 'San Francisco',
    };

    jest.spyOn(axios as jest.Mocked<typeof axios>, 'get').mockResolvedValueOnce({ data: mockData });

    const result = await ip.info('8.8.8.8');
    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith('http://ip-api.com/json/8.8.8.8');
  });

  it('should return undefined if IP API request fails', async () => {
    jest.spyOn(axios as jest.Mocked<typeof axios>, 'get').mockRejectedValueOnce(new Error('API error'));

    const result = await ip.info('8.8.8.8');
    expect(result).toBeUndefined();
    expect(axios.get).toHaveBeenCalledWith('http://ip-api.com/json/8.8.8.8');
  });
});
