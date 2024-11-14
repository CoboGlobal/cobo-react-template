import axios from 'axios';
import { getSign } from '@/toolkit/sign';

async function request(method: string, url: string, params?: any, data?: any, headers?: any) {
  try {
    const res = await axios.request({
      method,
      url,
      params,
      data,
      headers,
    });
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export function getVerifyInfo() {
  return request('GET', '/web/v2/oauth/authorize/jwks.json');
}

export function getAccessToken() {
  const method = 'GET';
  const url = '/web/v2/oauth/token';
  const params = {
    client_id: process.env.REACT_APP_APPID || '',
    org_id: localStorage.getItem('orgID') || '',
    grant_type: 'org_implicit',
  };
  const timestamp = new Date().getTime().toString();
  const signature = getSign(method, url, timestamp, params);
  const headers = {
    'BIZ-API-KEY': process.env.REACT_APP_PUBLIC_KEY,
    'BIZ-API-NONCE': timestamp,
    'BIZ-API-SIGNATURE': signature,
  };
  return request(method, url, params, undefined, headers);
}

export function getMfaMethods(userId: string) {
  const method = 'GET';
  const url = '/app/v2/mfa/mfa_list';
  const params = { user_id: userId };
  const timestamp = new Date().getTime().toString();
  const signature = getSign(method, url, timestamp, params);
  const headers = {
    'BIZ-API-KEY': process.env.REACT_APP_PUBLIC_KEY || '',
    'BIZ-API-NONCE': timestamp,
    'BIZ-API-SIGNATURE': signature,
    'AUTHORIZATION': `Bearer ${localStorage.getItem('accessToken')}`,
  };
  return request(method, url, params, undefined, headers);
}
