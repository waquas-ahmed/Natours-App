const express = require('express');
const authController = require('./../controller/authController');
// console.log('411');
const tourController = require('./../controller/tourController');
// const reviewController = require('./../controller/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');
// console.log('412');

const router = express.Router();

// router.param('id', tourController.checkID);

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthy-plan/:year').get(authController.protect, authController.restrictTo('admin', 'guide', 'lead-guide'), tourController.getMonthyPlan);
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/').get(tourController.getAllTours).post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);
router.route('/:id').get(tourController.getTour).patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour).delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview)
router.use('/:tourId/reviews', reviewRouter)
module.exports = router;
