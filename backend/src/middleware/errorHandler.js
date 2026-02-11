/**
 * Global error handler middleware.
 * Catches all errors thrown in route handlers and returns structured JSON responses.
 */
function errorHandler(err, req, res, next) {
    console.error(`[Error] ${err.message}`);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
}

/**
 * Custom AppError class for throwing errors with specific status codes.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { errorHandler, AppError };
