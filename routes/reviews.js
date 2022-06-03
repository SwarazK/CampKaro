const express = require("express");
const router = express.Router({mergeParams: true}); // By default router keeps parameters of routes separate
const Campground = require('../models/campgrounds');
const Review = require('../models/reviews');


const catchAsync = require("../utils/catchAsync");
const ExpressError = require('../utils/ExpressErrors');
const {isLoggedIn, validateReview, isReviewAuthor} = require("../middleware");

const reviews = require("../controllers/reviews");


//*********************************************************************//
//                          Review Routes                              //
//*********************************************************************//

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview));

module.exports = router;