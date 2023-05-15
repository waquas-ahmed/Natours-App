const express = require('express');

const authController = require('./../controller/authController');
const reviewcontroller = require('./../controller/reviewController');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router.route('/')
    .get(reviewcontroller.getAllReviews)
    .post(authController.protect, authController.restrictTo('user'), reviewcontroller.setTourUserIds, reviewcontroller.createReview);

router.route('/:id').get(reviewcontroller.getReview).patch(reviewcontroller.updateReview).delete(reviewcontroller.deleteReview);
module.exports = router;