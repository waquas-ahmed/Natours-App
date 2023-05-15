class AppError extends Error {
    constructor(message, statusCode) {
        super(message); // parent class is here
        this.statusCode = statusCode; // Error parent ka statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // Error parent ka status
        this.isOperational = true; // Error parent mein adding isOperational
        Error.captureStackTrace(this, this.constructor);
    }

}
module.exports = AppError;