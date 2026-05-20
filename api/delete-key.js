// api/delete-key.js - 管理员删除密钥
export default async function handler(req, res) {
  const { key, adminToken } = req.body || {};

  if (adminToken !== 'HM78Z') {
    return res.status(403).json({ error: '无权限' });
  }

  if (!key) {
    return res.status(400).json({ error: '缺少密钥' });
  }

  // 纯前端方案：前端自行管理删除
  return res.json({ success: true, note: '请在前端本地删除此密钥' });
}