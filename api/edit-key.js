// api/edit-key.js - 管理员编辑密钥（修改题库或备注）
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, bankId, remark, adminToken } = req.body || {};

  if (adminToken !== 'HM78Z') {
    return res.status(403).json({ error: '无权限' });
  }

  if (!key || !bankId) {
    return res.status(400).json({ error: '参数不完整' });
  }

  try {
    const { kv } = await import('@vercel/kv');

    const keyData = await kv.get(`key:${key}`);
    if (!keyData) {
      return res.status(404).json({ error: '密钥不存在' });
    }

    const data = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;

    await kv.set(`key:${key}`, JSON.stringify({
      ...data,
      bankId,
      remark: remark || data.remark || ''
    }));

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误: ' + e.message });
  }
}