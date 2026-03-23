const { StatusCodes } = require("http-status-codes");

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "Authentication required" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(StatusCodes.FORBIDDEN).json({ ok: false, error: `Access denied. Required role: ${roles.join(" or ")}` });
  }
  next();
};

const requireVerifiedDoctor = (req, res, next) => {
  if (req.user?.role !== "doctor") {
    return res.status(StatusCodes.FORBIDDEN).json({ ok: false, error: "Doctor access required" });
  }
  if (req.user?.status !== "verified") {
    return res.status(StatusCodes.FORBIDDEN).json({ ok: false, error: "Doctor account pending verification" });
  }
  next();
};

module.exports = { requireRole, requireVerifiedDoctor };
