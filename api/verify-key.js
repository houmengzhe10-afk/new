// api/verify-key.js - 验证密钥（纯算法验证，无需数据库）
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, fingerprint } = req.body || {};

  if (!key || !fingerprint) {
    return res.status(400).json({ error: '参数不完整', verified: false });
  }

  try {
    // 从密钥中解码 bankId
    const decoded = decodeKey(key);

    if (!decoded) {
      return res.json({ error: '密钥无效或不存在', verified: false });
    }

    return res.json({
      verified: true,
      bankId: decoded.bankId,
      key: key
    });
  } catch (e) {
    return res.json({ error: '密钥验证失败', verified: false });
  }
}

// 从自包含密钥中解码信息
function decodeKey(key) {
  try {
    const parts = key.split('.');
    if (parts.length !== 3) return null;

    const [rawKey, encoded, checksum] = parts;

    // 验证校验和
    const expected = simpleHash(rawKey + encoded).substring(0, 4);
    if (checksum !== expected) return null;

    // 解码 bankId
    const bankId = decodeURIComponent(escape(atob(encoded)));

    return { bankId, rawKey };
  } catch (e) {
    return null;
  }
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h).toString(16);
}