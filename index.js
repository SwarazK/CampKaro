const express = require('express');
const path = require('path'); // To dynamically set the paths
const mongoose = require('mongoose');
const Campground = require('./models/campgrounds');
const Review = require('./models/reviews');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require('./utils/ExpressErrors');
const {campgroundSchema, reviewSchema} = require("./schemas");

const campgrounds = require("./routes/campgrounds");


mongoose.connect('mongodb://localhost:27017/camp-karo',{ // Why those three properties are specified
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database Connected");
});

const app  = express();

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.urlencoded({extended : true})); // For parsing the input from the forms
app.use(methodOverride('_method')); // For getting requests other than GET and POST from forms

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

app.use("/campgrounds", campgrounds); // Pass all requests starting with /campgrounds to the campgrounds route

app.get('/',(req,res)=>{ // Route for the home page of the website
    res.render('home');
});

//*********************************************************************//
//                          Review Routes                              //
//*********************************************************************//

app.post('/campgrounds/:id/reviews', validateReview, catchAsync( async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req,res)=>{
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

// Catches all requests that dont hit the previous routes
app.all('*',(req,res,next)=>{ 
    next(new ExpressError('Page Not Found'),404);
})

// Basic error handling middleware that'll respond to every error that is thrown
app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    res.status(statusCode).render("error",{err});
});

app.listen(3000, ()=>{
    console.log('Listening on port 3000');
});