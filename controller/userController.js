const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const handlerFactory = require('./handlerFactory');

const filterObj = (objBody, ...allowedFields) => {
    const newObject = {}
    Object.keys(objBody).forEach(el => {
        if (allowedFields.includes(el)) newObject[el] = objBody[el];
    });
    return newObject;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Check if client enter password then send the error msg to check other route to do so.
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for the password update!.. Please use /updateMyPassword', 400))
    }

    // 2) Filter out the unwanted fields that are not allowed to be updated!
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Update the document with the new data
    // const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    //     new: true,
    //     runValidators: true
    // });
    const updatedUser = await User.findById(req.user.id);
    Object.keys(filteredBody).forEach(el => {
        updatedUser[el] = req.body[el];
    });
    await updatedUser.save({ validateBeforeSave: false });

    // 4) send response to the user or client
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: "success",
        data: null
    });
});


exports.getAllUsers = handlerFactory.getAll(User);

exports.getUser = handlerFactory.getOne(User);

exports.createUser = handlerFactory.createOne(User);


exports.deleteUser = handlerFactory.deleteOne(User);
exports.updateUser = handlerFactory.updateOne(User)
