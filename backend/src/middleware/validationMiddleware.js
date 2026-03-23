const { StatusCodes } = require("http-status-codes");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => d.message.replace(/['"]/g, ""));
    return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: errors[0], errors });
  }
  next();
};

module.exports = { validate };
