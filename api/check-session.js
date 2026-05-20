// api/check-session.js - 检查浏览器是否已有有效会话
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fingerprint } = req.body || {};

  if (!fingerprint) {
    return res.status(400).json({ error: '参数不完整' });
  }

  try {
    const { kv } = await import('@vercel/kv');

    // 扫描所有密钥，查找是否有绑定到当前浏览器的
    const keyIndex = await kv.get('key:index') || '';

    if (!keyIndex) {
      return res.json({ active: false, bankId: null });
    }

    const keys = keyIndex.split(',');
    for (const key of keys) {
      if (!key) continue;
      const keyData = await kv.get(`key:${key}`);
      if (!keyData) continue;

      const data = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;

      // 检查是否有绑定到当前浏览器的密钥
      if (data.bound && data.fingerprint === fingerprint) {
        return res.json({
          active: true,
          key,
          bankId: data.bankId,
          remark: data.remark || '',
          boundAt: data.boundAt
        });
      }
    }

    return res.json({ active: false, bankId: null });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误: ' + e.message, active: false });
  }
}