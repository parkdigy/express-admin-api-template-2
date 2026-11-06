import axios from 'axios';
import dns from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import { BlockList, isIP, type LookupFunction } from 'node:net';

export const URL_DOWNLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const URL_DOWNLOAD_TIMEOUT_MS = 30_000;
export const URL_DOWNLOAD_MAX_REDIRECTS = 3;

const blockedAddresses = new BlockList();

[
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
].forEach(([address, prefix]) => blockedAddresses.addSubnet(address as string, prefix as number, 'ipv4'));

[
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['64:ff9b:1::', 48],
  ['2001::', 23],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
].forEach(([address, prefix]) => blockedAddresses.addSubnet(address as string, prefix as number, 'ipv6'));

const safeLookup: LookupFunction = (hostname, options, callback) => {
  dns.lookup(
    hostname,
    {
      all: true,
      family: options.family,
      hints: options.hints,
      verbatim: true,
    },
    (err, addresses) => {
      if (err) {
        callback(err, '', 0);
        return;
      }

      if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIpAddress(address))) {
        const lookupError = new Error('사설망 또는 예약된 IP 주소에는 접근할 수 없습니다.') as NodeJS.ErrnoException;
        lookupError.code = 'EACCES';
        callback(lookupError, '', 0);
        return;
      }

      if (options.all) {
        callback(null, addresses);
      } else {
        callback(null, addresses[0].address, addresses[0].family);
      }
    }
  );
};

const httpAgent = new http.Agent({ lookup: safeLookup });
const httpsAgent = new https.Agent({ lookup: safeLookup });

/********************************************************************************************************************
 * isPublicIpAddress
 * ******************************************************************************************************************/
export function isPublicIpAddress(address: string) {
  const family = isIP(address);
  if (family === 0) return false;

  return !blockedAddresses.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

/********************************************************************************************************************
 * parseDownloadUrl
 * ******************************************************************************************************************/
export function parseDownloadUrl(url: string) {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('URL 형식이 올바르지 않습니다.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('HTTP 또는 HTTPS URL만 사용할 수 있습니다.');
  }
  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('인증 정보가 포함된 URL은 사용할 수 없습니다.');
  }

  const hostname = parsedUrl.hostname.startsWith('[') ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
  if (isIP(hostname) && !isPublicIpAddress(hostname)) {
    throw new Error('사설망 또는 예약된 IP 주소에는 접근할 수 없습니다.');
  }

  return parsedUrl;
}

/********************************************************************************************************************
 * downloadDataFromUrl
 * ******************************************************************************************************************/
export async function downloadDataFromUrl(url: string) {
  const parsedUrl = parseDownloadUrl(url);

  const response = await axios.get<ArrayBuffer>(parsedUrl.toString(), {
    responseType: 'arraybuffer',
    timeout: URL_DOWNLOAD_TIMEOUT_MS,
    maxContentLength: URL_DOWNLOAD_MAX_BYTES,
    maxBodyLength: URL_DOWNLOAD_MAX_BYTES,
    maxRedirects: URL_DOWNLOAD_MAX_REDIRECTS,
    proxy: false,
    httpAgent,
    httpsAgent,
    beforeRedirect(options) {
      if (!['http:', 'https:'].includes(options.protocol)) {
        throw new Error('HTTP 또는 HTTPS 리다이렉트만 사용할 수 있습니다.');
      }
    },
  });

  return Buffer.from(response.data);
}

/********************************************************************************************************************
 * export
 * ******************************************************************************************************************/
export default downloadDataFromUrl;
