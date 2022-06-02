const express = require("express");
const router = express.Router({mergeParams: true}); // By default router keeps parameters of routes separate
const Campground = require('../models/campgrounds');
const Review = require('../models/reviews');
const {reviewSchema} = require("../schemas");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require('../utils/ExpressErrors');
const {isLoggedIn} = require("../middleware");

const validateReview= (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(','); // We convert the message object into a string
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}

//*********************************************************************//
//                          Review Routes                              //
//*********************************************************************//

router.post('/', isLoggedIn, validateReview, catchAsync( async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Added a new review");
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete("/:reviewId", isLoggedIn, catchAsync(async (req,res)=>{
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted a review");
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;