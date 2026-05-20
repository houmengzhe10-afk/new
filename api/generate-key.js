// api/generate-key.js - 管理员生成密钥
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { bankId, customKey, adminToken, remark } = req.body || {};

  if (adminToken !== 'HM78Z') return res.status(403).json({ error: '无权限' });
  if (!bankId) return res.status(400).json({ error: '请选择题库' });

  const rawKey = customKey || generateRandomKey();
  const encoded = Buffer.from(bankId, 'utf-8').toString('base64');
  const checksum = simpleHash(rawKey + encoded).substring(0, 4);
  const key = `${rawKey}.${encoded}.${checksum}`;

  return res.json({ success: true, key, remark: remark || '' });
}

function generateRandomKey() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let key = '';
  for (let i = 0; i < 8; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; }
  return Math.abs(h).toString(16);
}