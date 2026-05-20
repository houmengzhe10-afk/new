// api/check-session.js - 检查浏览器绑定（无需数据库，仅校验本地状态）
export default async function handler(req, res) {
  const { fingerprint } = req.body || {};

  if (!fingerprint) {
    return res.status(400).json({ active: false });
  }

  // 纯前端方案：浏览器绑定由前端 localStorage 管理
  // 此接口仅返回可用状态，实际绑定在前端处理
  return res.json({ active: false });
}