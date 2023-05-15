const AppError = require("../utils/appError");

const handleDuplicateFieldsDB = err => {
    const value = err.keyValue.name;
    const message = `Duplicate field Value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 404);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input Data: ${errors.join(', ')}`
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token!! Please login it again', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired!! Please log in again', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
        // programming and other unknown error : do not leak error details
    } else {
        res.status(err.statusCode).json({
            status: 'error',
            error: err,
            message: err.message
        });
    }
}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
            sendErrorProd(error, res);
        } else if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
            sendErrorProd(error, res);
        } else if (err.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
            sendErrorProd(error, res);
        } else if (err.name === 'JsonWebTokenError') {
            error = handleJWTError();
            sendErrorProd(error, res);
        } else if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
            sendErrorProd(error, res);
        } else {
            sendErrorProd(err, res);
        }

    }
}