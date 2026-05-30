// api/generate-key.js - 管理员生成密钥（绑定浏览器ID）
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { bankId, customKey, adminToken, remark, browserId } = req.body || {};

  if (adminToken !== 'HM78Z') return res.status(403).json({ error: '无权限' });
  if (!bankId) return res.status(400).json({ error: '请选择题库' });
  if (!browserId) return res.status(400).json({ error: '请输入要绑定的浏览器ID' });

  const cleanBid = String(browserId).trim().toUpperCase();
  if (!/^[A-Z0-9_]{3,64}$/.test(cleanBid)) return res.status(400).json({ error: '浏览器ID格式不合法' });

  const rawKey = customKey || generateRandomKey();
  const bankEncoded = b64(bankId);
  const bidEncoded = b64(cleanBid);
  const checksum = simpleHash(rawKey + '|' + bankEncoded + '|' + bidEncoded).substring(0, 6);
  const key = `${rawKey}.${bankEncoded}.${bidEncoded}.${checksum}`;

  return res.json({ success: true, key, remark: remark || '', browserId: cleanBid });
}

function generateRandomKey() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let key = '';
  for (let i = 0; i < 8; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

function b64(s) {
  return Buffer.from(s, 'utf-8').toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; }
  return Math.abs(h).toString(16);
}
