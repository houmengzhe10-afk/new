// api/verify-key.js - 验证密钥 + 浏览器ID强绑定
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { key, browserId } = req.body || {};
  if (!key || !browserId) return res.status(400).json({ error: '参数不完整', verified: false });

  const curBid = String(browserId).trim().toUpperCase();

  const decoded = decodeKey(key);
  if (!decoded) return res.json({ error: '密钥无效或不存在', verified: false });

  if (decoded.browserId !== curBid) {
    return res.json({ error: '此密钥已绑定其他浏览器，无法在当前设备使用', verified: false });
  }

  return res.json({ verified: true, bankId: decoded.bankId, browserId: decoded.browserId, key });
}

function decodeKey(key) {
  try {
    const parts = key.split('.');
    if (parts.length !== 4) return null;

    const [rawKey, bankEncoded, bidEncoded, checksum] = parts;

    const expected = simpleHash(rawKey + '|' + bankEncoded + '|' + bidEncoded).substring(0, 6);
    if (checksum !== expected) return null;

    const bankId = b64decode(bankEncoded);
    const browserId = b64decode(bidEncoded);

    return { bankId, browserId, rawKey };
  } catch (e) {
    return null;
  }
}

function b64decode(s) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from((s + pad).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; }
  return Math.abs(h).toString(16);
}
