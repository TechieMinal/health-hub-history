const { getAnalytics } = require("../services/analyticsService");
const { cache } = require("../config/redis");

exports.getAnalytics = async (req, res) => {
  const cacheKey = "analytics:summary";
  const cached = await cache.get(cacheKey);
  if (cached) return res.json({ ok: true, ...cached, cached: true });

  const data = await getAnalytics();
  await cache.set(cacheKey, data, 300); // 5 min cache
  res.json({ ok: true, ...data });
};
