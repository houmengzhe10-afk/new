// api/verify-key.js - 用户验证密钥，绑定浏览器
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, fingerprint } = req.body || {};

  if (!key || !fingerprint) {
    return res.status(400).json({ error: '参数不完整' });
  }

  try {
    const { kv } = await import('@vercel/kv');

    const keyData = await kv.get(`key:${key}`);

    if (!keyData) {
      return res.status(404).json({ error: '密钥无效或不存在', verified: false });
    }

    const data = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;

    // 如果已绑定，验证是否匹配当前浏览器
    if (data.bound && data.fingerprint) {
      const isMatch = crypto.timingSafeEqual
        ? crypto.timingSafeEqual(Buffer.from(data.fingerprint), Buffer.from(fingerprint))
        : data.fingerprint === fingerprint;

      if (!isMatch) {
        return res.json({ error: '密钥已绑定其他浏览器', verified: false });
      }
    }

    // 绑定当前浏览器
    await kv.set(`key:${key}`, JSON.stringify({
      ...data,
      bound: true,
      fingerprint,
      boundAt: new Date().toISOString()
    }));

    return res.json({ verified: true, bankId: data.bankId, remark: data.remark || '' });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误: ' + e.message, verified: false });
  }
}