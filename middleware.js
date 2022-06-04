const Campground = require('./models/campgrounds');
const Review = require('./models/reviews');
const {campgroundSchema} = require("./schemas");
const {reviewSchema} = require("./schemas");
const ExpressError = require('./utils/ExpressErrors');

module.exports.isLoggedIn = (req, res, next) =>{ // Used to check if a user is logged in or not
    if(!req.isAuthenticated()){ // isAuthenticated is provided by passport
        req.session.returnTo = req.originalUrl; // Stores the full address of the page on which the middleware was called
        // console.log(req.session.returnTo);
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
}

module.exports.validateCampground= (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(','); // We convert the message object into a string
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}

module.exports.isAuthor = async (req,res,next) => { // Middleware to ensure only the author is allowed to modify a campground
    const campground = await Campground.findById(req.params.id);

    if(!campground.author.equals(req.user._id)){
        req.flash("error", "You dont have permission to do that.");
        return res.redirect(`/campgrounds/${req.params.id}`);
    }
    next();
}

module.exports.validateReview= (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(','); // We convert the message object into a string
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}

module.exports.isReviewAuthor = async (req,res,next) => { // Middleware to ensure only the author is allowed to modify a campground
    const {id,reviewId} = req.params;
    const review = await Review.findById(reviewId);

    if(!review.author.equals(req.user._id)){
        req.flash("error", "You dont have permission to do that.");
        return res.redirect(`/campgrounds/${req.params.id}`);
    }
    next();
}
