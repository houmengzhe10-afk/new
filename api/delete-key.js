// api/delete-key.js - 管理员删除密钥
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, adminToken } = req.body || {};

  if (adminToken !== 'HM78Z') {
    return res.status(403).json({ error: '无权限' });
  }

  if (!key) {
    return res.status(400).json({ error: '缺少密钥' });
  }

  try {
    const { kv } = await import('@vercel/kv');

    await kv.del(`key:${key}`);

    // 更新索引
    const keyIndex = await kv.get('key:index') || '';
    const newIndex = keyIndex.split(',').filter(k => k !== key && k !== '').join(',');
    await kv.set('key:index', newIndex);

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误: ' + e.message });
  }
}