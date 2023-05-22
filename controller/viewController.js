const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {

    // 1) Get tour data from the collection
    const tours = await Tour.find();


    // 2) Build template
    // 3) Render that template using tour data from step 1)

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Get the tour for the required tour (including reviews and user)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name', 404));
    }
    // 2) Build the template
    // 3) Render the template using data from step 1)
    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour',
        tour
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
}