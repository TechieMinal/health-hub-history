const User = require("../models/User");
const Record = require("../models/Record");
const Payment = require("../models/Payment");

const getAnalytics = async () => {
  const [users, records, payments] = await Promise.all([
    User.find().lean(),
    Record.find().lean(),
    Payment.find({ status: "paid" }).lean(),
  ]);

  const planDist = { Free: 0, Basic: 0, Premium: 0, Hospital: 0 };
  users.forEach((u) => { if (planDist[u.plan] !== undefined) planDist[u.plan]++; });

  const catCounts = {};
  records.forEach((r) => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
  const catDist = Object.entries(catCounts).map(([k, v]) => [k, v]);

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => ["active", "verified"].includes(u.status)).length,
    totalDoctors: users.filter((u) => u.role === "doctor").length,
    verifiedDoctors: users.filter((u) => u.role === "doctor" && u.status === "verified").length,
    pendingDoctors: users.filter((u) => u.role === "doctor" && u.status === "pending_verification").length,
    totalRecords: records.length,
    storageUsed: users.reduce((s, u) => s + (u.storage_used || 0), 0).toFixed(1),
    mrr: payments.reduce((s, p) => s + p.amount, 0),
    planDist,
    catDist,
    recentPayments: payments.slice(-5).reverse(),
  };
};

module.exports = { getAnalytics };
