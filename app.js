// console.log('4');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const reviewRouter = require('./routes/reviewRoutes');
const viewsRoute = require('./routes/viewsRoute');

const app = express();
// console.log('41');

// setting of the pug engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); //ye view folder hai

// 1) Global Middlewares

// serving the static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set security http headers
// app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // o/p like in console- GET /api/v1/tours 200 8.550 ms - 8755
}

// limit requests from same IP
// const limiter = rateLimit({
//     max: 1000,
//     windowMs: 60 * 60 * 1000,
//     message: 'Too many requests from this IP. Please try again in an hour'
// });
// app.use('/api', limiter);

// body parser reading data from the body into req.body
app.use(express.json({ limit: '10kb' })); //middleware
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Data Sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
// app.use(hpp({ whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'] }));

// Test middleware
app.use((req, res, next) => {
    req.requestTimeAccurate = new Date().toISOString();
    // console.log('reso-cook2', req.cookies);
    next();
});

// 3) Routers


app.use('/', viewsRoute);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// agar koi route match nhi karega to ye piece of code execute hoga
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // });
    // const error = new Error(`Can't find ${req.originalUrl} on this server`);
    // error.status = 'fail';
    // error.statusCode = 404;
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Handling global error: Agar upar kahin error catch nhi hua to yahan pe definitely catch ho jaayega
app.use(globalErrorHandler);

// 4) Server
module.exports = app;
