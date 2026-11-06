/********************************************************************************************************************
 * IP 모듈
 * ******************************************************************************************************************/
import axios from 'axios';

/** IP 정보 구조 */
interface GetIpInfoResult {
  status: string;
  message?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  query?: string;
}

export const ip = {
  /********************************************************************************************************************
   * IP 정보 조회
   * @param ip IP 주소
   * @returns IP 정보
   * ******************************************************************************************************************/
  async info(ip: string): Promise<GetIpInfoResult | undefined> {
    if (ip && !ip.startsWith('127.') && !ip.startsWith('192.')) {
      try {
        const res = await axios.get(`http://ip-api.com/json/${ip}`);
        return res.data;
      } catch {
        //
      }
    }
  },
};

export default ip;
