// api/edit-key.js - 管理员编辑密钥
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { key, bankId, remark, adminToken } = req.body || {};
  if (adminToken !== 'HM78Z') return res.status(403).json({ error: '无权限' });
  if (!key || !bankId) return res.status(400).json({ error: '参数不完整' });

  const rawKey = key.split('.')[0];
  const encoded = Buffer.from(bankId, 'utf-8').toString('base64');
  const checksum = simpleHash(rawKey + encoded).substring(0, 4);
  const newKey = `${rawKey}.${encoded}.${checksum}`;

  return res.json({ success: true, key: newKey, remark: remark || '' });
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; }
  return Math.abs(h).toString(16);
}