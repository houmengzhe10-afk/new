// api/list-keys.js - 管理员查看密钥列表（返回空，前端自管理）
export default async function handler(req, res) {
  const { adminToken } = req.body || {};

  if (adminToken !== 'HM78Z') {
    return res.status(403).json({ error: '无权限' });
  }

  // 纯前端方案：密钥列表由前端 localStorage 管理
  return res.json({ keys: [], note: '密钥列表由浏览器本地存储管理' });
}