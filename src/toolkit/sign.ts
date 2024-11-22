import * as ed25519 from '@noble/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { sha512 } from '@noble/hashes/sha512';
import { bytesToHex } from '@noble/hashes/utils';
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

export function getSign(
  method: string,
  url: string,
  api_nonce: string,
  params?: Record<string, any> | string,
  data?: Record<string, any> | string,
) {
  const message = [
    method,
    url,
    api_nonce,
    params ? new URLSearchParams(params).toString() : '',
    data ? JSON.stringify(data) : '',
  ].join('|');
  const privateKey = process.env.REACT_COBO_APP_SECRET || '';

  const hash256 = bytesToHex(sha256(sha256(message)));
  const signature = bytesToHex(ed25519.sign(hash256, privateKey));
  return signature;
}
