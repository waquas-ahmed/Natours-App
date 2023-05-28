const multer = require('multer');
const sharp = require('sharp');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const handlerFactory = require('./handlerFactory');

// ye way disk mein store hoga
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

// ab as a buffer store karenge memory mein
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image Please upload the image only', 400), false)
    }
}


const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// const upload = multer({ dest: 'public/img/users' })

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .toFile(`public/img/users/${req.file.filename}`);
    next();
});

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

    if (req.file) filteredBody.photo = req.file.filename;

    // console.log('filteredBody', filteredBody);
    // 3) Update the document with the new data
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    // const updatedUser = await User.findById(req.user.id);
    // console.log('filteredBody', updatedUser);
    // Object.keys(filteredBody).forEach(el => {
    //     updatedUser[el] = req.body[el];
    // });
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
