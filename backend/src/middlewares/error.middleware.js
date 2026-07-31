const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If it's not an instance of custom ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
  };

  // Log error stack trace for debugging in dev environment
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
