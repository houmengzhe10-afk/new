// api/list-keys.js - 管理员查看密钥列表
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminToken } = req.body || {};

  if (adminToken !== 'HM78Z') {
    return res.status(403).json({ error: '无权限' });
  }

  try {
    const { kv } = await import('@vercel/kv');

    const keyIndex = await kv.get('key:index') || '';

    if (!keyIndex) {
      return res.json({ keys: [] });
    }

    const keys = keyIndex.split(',');
    const result = [];

    for (const key of keys) {
      if (!key) continue;
      const keyData = await kv.get(`key:${key}`);
      if (!keyData) continue;

      const data = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;
      result.push({
        key,
        bankId: data.bankId,
        bound: data.bound,
        fingerprint: data.fingerprint,
        createdAt: data.createdAt,
        boundAt: data.boundAt,
        remark: data.remark || ''
      });
    }

    return res.json({ keys: result });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误: ' + e.message, keys: [] });
  }
}