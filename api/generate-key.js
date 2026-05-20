// api/generate-key.js - 管理员生成密钥
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bankId, customKey, adminToken, remark } = req.body || {};

  // 管理员验证
  if (adminToken !== 'HM78Z') {
    return res.status(403).json({ error: '无权限' });
  }

  if (!bankId) {
    return res.status(400).json({ error: '请选择题库' });
  }

  const key = customKey || generateRandomKey();

  try {
    const { kv } = await import('@vercel/kv');

    // 检查密钥是否已存在
    const existing = await kv.get(`key:${key}`);
    if (existing) {
      return res.status(400).json({ error: '密钥已存在' });
    }

    // 存储密钥信息
    await kv.set(`key:${key}`, JSON.stringify({
      bankId,
      createdAt: new Date().toISOString(),
      bound: false,
      fingerprint: null,
      remark: remark || ''
    }));

    // 更新密钥索引，方便 check-session 扫描
    let keyIndex = await kv.get('key:index') || '';
    if (keyIndex) {
      keyIndex += ',' + key;
    } else {
      keyIndex = key;
    }
    await kv.set('key:index', keyIndex);

    return res.json({ success: true, key });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误: ' + e.message });
  }
}

function generateRandomKey() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let key = '';
  for (let i = 0; i < 8; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}