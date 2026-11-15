import crypto from 'crypto';

/**
 * Cryptographically verifies Segpay server-to-server postback signatures.
 */
export function verifySegpaySignature(data: URLSearchParams, secret: string, receivedHash: string): boolean {
  if (!receivedHash || !secret) return false;

  const sortedParams = Array.from(data.entries())
    .filter(([k]) => k !== 'hash' && k !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const hmac256 = crypto.createHmac('sha256', secret).update(sortedParams).digest('hex');
  const hmacMd5 = crypto.createHmac('md5', secret).update(sortedParams).digest('hex');
  const rawConcat = secret + (data.get('tranid') || '') + (data.get('action') || '') + (data.get('price') || '');
  const md5Raw = crypto.createHash('md5').update(rawConcat).digest('hex');
  const directHmac = crypto.createHmac('sha256', secret).update(data.toString()).digest('hex');

  const candidates = [hmac256, hmacMd5, md5Raw, directHmac];

  for (const cand of candidates) {
    if (cand.length === receivedHash.length) {
      if (crypto.timingSafeEqual(Buffer.from(cand.toLowerCase(), 'utf8'), Buffer.from(receivedHash.toLowerCase(), 'utf8'))) {
        return true;
      }
    }
  }

  return false;
}
