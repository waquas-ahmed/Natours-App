const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const Email = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // agar secure true hoga to postman ke response mein wo cookies nhi dikhega

    res.cookie('jwt', token, cookieOptions);

    // Removing password from the output
    user.password = undefined;

    res.status(statusCode).json({
        message: 'success',
        token,
        data: {
            user: user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    const url = 'http://127.0.0.1:3000/me';
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // check if email and password exist!!
    if (!email || !password) return next(new AppError('Please provide email or password!!', 400));

    // check if user exists && password is correct!!
    const user = await User.findOne({ email }).select('+password');
    // const correctPassword = await user.correctPassword(password, user.password);

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password!!', 401));
    }

    // if everything ok then send token to the client!!
    createSendToken(user, 201, res);
});

exports.logout = catchAsync((req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
});

exports.protect = catchAsync(async function (req, res, next) {

    // 1) Getting token and check if its there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in!! Please login to get the access!!'))
    }

    // 2) verification of the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer!', 401))
    }

    // 4) check the user change the password after the token was issued!
    // if (!currentUser.changedPasswordAfter(decoded.iat)) {
    //     next(new AppError('User recently changed the password! Please log in again!', 401));
    // }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to do this action!', 403))
        }
        next();
    }
}


exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError('There is no user with this email address!!', 404));

    // 2) Generate the random reset token
    const resetToken = user.correctPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Sent new reset token to the user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    // const message = `Forgot your password ?.... Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email`;

    try {
        // await sendMail({
        //     email: user.email,
        //     subject: 'Your password reset token (valid for 10 mins)',
        //     message
        // });

        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get the user based on the token sent in the mail
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    // 2) If token has not expired then fetch the user then set the new password.
    if (!user) return next(new AppError('Token is invalid and has expired!!', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // password same pass nhi karenge to ye error yahan se aayega: Passwords are not the same

    // 3) also set the changePasswordAt for the user
    // <DID IN THE USER MODEL>

    // 4) Log the user in and send token back to the client

    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get the user from the collection with the help of id from protect function
    const user = await User.findById(req.user.id).select('+password');

    // 2) check if POSTed password is correct or not match with the DB
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is not correct', 401))
    }

    // 3) If so update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log user in and send JWT
    createSendToken(user, 200, res);

});

exports.isLoggedIn = async function (req, res, next) {
    try {
        if (req.cookies.jwt) {

            // 1) verify token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

            // 2) check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 4) check the user change the password after the token was issued!
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // There is logged in users
            res.locals.user = currentUser;
            return next();
        }
    } catch (error) {
        return next();
    }

    next();
};