const AppError = require("../utils/AppError");

function prismaToAppError(error) {
  switch (error.code) {
    case "P2002": // unique constraint (e.g. email already registered)
      return new AppError(
        `${error.meta?.target ?? "Field"} already exists`,
        409,
      );
    case "P2025": // record not found on update/delete
      return new AppError("Resource not found", 404);
    case "P2003": // foreign key (e.g. deleting a product that has orders)
      return new AppError(
        "This resource is linked to other records and cannot be removed",
        409,
      );
    default:
      return null;
  }
}

function errorHandler(err, req, res, _next) {
  let error = err;

  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    error = prismaToAppError(err) ?? err;
  }

  if (err.type === "entity.parse.failed") {
    error = new AppError("Request body is not valid JSON", 400);
  }

  const statusCode = error.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message:
      isServerError && process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message,
    ...(error.details && { errors: error.details }),
    ...(process.env.NODE_ENV === "development" &&
      isServerError && { stack: err.stack }),
  });
}


module.exports = errorHandler;