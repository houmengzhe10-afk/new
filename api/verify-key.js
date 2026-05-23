// api/verify-key.js - 验证密钥 + 指纹绑定
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { key, fingerprint } = req.body || {};
  if (!key || !fingerprint) return res.status(400).json({ error: '参数不完整', verified: false });

  try {
    // 尝试以绑定格式解析：key.bindToken
    const bindIndex = key.lastIndexOf('.bind_');
    if (bindIndex !== -1) {
      // 已绑定密钥：验证指纹是否匹配
      const rawKey = key.substring(0, bindIndex);
      const bindToken = key.substring(bindIndex + 6); // 跳过 ".bind_"

      const decoded = decodeKey(rawKey);
      if (!decoded) return res.json({ error: '密钥无效或不存在', verified: false });

      const expectedBind = bindHash(fingerprint, rawKey);
      if (bindToken !== expectedBind) {
        return res.json({ error: '此密钥已在其他设备上绑定，请在原设备使用或联系管理员', verified: false });
      }

      return res.json({ verified: true, bankId: decoded.bankId, key: rawKey, bound: true });
    }

    // 未绑定密钥：首次验证，创建绑定
    const decoded = decodeKey(key);
    if (!decoded) return res.json({ error: '密钥无效或不存在', verified: false });

    const bindToken = bindHash(fingerprint, key);
    const boundKey = key + '.bind_' + bindToken;

    return res.json({ verified: true, bankId: decoded.bankId, key, boundKey, bound: true });
  } catch (e) {
    return res.json({ error: '密钥验证失败', verified: false });
  }
}

function decodeKey(key) {
  try {
    const parts = key.split('.');
    if (parts.length !== 3) return null;

    const [rawKey, encoded, checksum] = parts;

    const expected = simpleHash(rawKey + encoded).substring(0, 4);
    if (checksum !== expected) return null;

    const bankId = Buffer.from(encoded, 'base64').toString('utf-8');

    return { bankId, rawKey };
  } catch (e) {
    return null;
  }
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; }
  return Math.abs(h).toString(16);
}

function bindHash(fingerprint, key) {
  return simpleHash(fingerprint + ':' + key).substring(0, 12);
}