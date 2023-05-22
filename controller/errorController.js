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

const sendErrorDev = (err, req, res) => {

    // A) API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    // B) Rendered website
    console.log('error', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
}

const sendErrorProd = (err, req, res) => {

    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // A) Operation trusted error and will send this message to the client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }

        // B) Programming or other unknown error and don;t leak the user details
        return res.status(err.statusCode).json({
            status: 'error',
            error: err,
            message: err.message
        });

    }

    // B) Rendered website

    // A) operational error and trusted error and will sent this message to the client
    if (err.isOperational) {
        return res.status(500).json({
            title: 'Something went wrong!',
            msg: err.message
        });
    }

    // B) Programming and other unkonwn error dont leak the error details
    // send the genuine message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later'
    });
};


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }
        sendErrorProd(error, req, res);
    }
}