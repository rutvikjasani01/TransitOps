export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "An unexpected server error occurred." : error.message,
    ...(error.details && { errors: error.details })
  });
};
