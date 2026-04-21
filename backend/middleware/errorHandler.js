const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || res.statusCode || 500;
  let message = error.message || "Internal server error";
  let details = error.errors;

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "A record with the same value already exists";
  }

  res.status(statusCode >= 400 ? statusCode : 500).json({
    message,
    errors: details || undefined,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
