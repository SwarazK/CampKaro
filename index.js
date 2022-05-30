const express = require('express');
const path = require('path'); // To dynamically set the paths
const mongoose = require('mongoose');
const Campground = require('./models/campgrounds');
const Review = require('./models/reviews');
const methodOverride = require('method-override');
const { allowedNodeEnvironmentFlags } = require('process');
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require('./utils/ExpressErrors');
const {campgroundSchema, reviewSchema} = require("./schemas");



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


const validateCampground= (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(','); // We convert the message object into a string
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}

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


app.get('/',(req,res)=>{ // Route for the home page of the website
    res.render('home');
});

//*********************************************************************//
//                         Campground Routes                           //
//*********************************************************************//

// app.get('/makecampground', async (req,res)=>{
//     const camp = new Campground({title : "My Background", description: 'Cheap camping!'});
//     await camp.save(); // Figure out how this method works
//     res.send(camp);
// })

app.get('/campgrounds',catchAsync(async(req,res) =>{ // Route for the main display page of the website
    const campgrounds = await Campground.find({}); // Finds ans retrieves all the campgrounds from the DB
    res.render('campgrounds/index', {campgrounds}); // The retrieved campgrounds are passed to the ejs file as an object
}));

// A form for adding new camps :
// Two routes, a page and a route to access the form using a GET request and then a POST request to update the database and to redirect to the index/main display

app.get('/campgrounds/new',(req,res) =>{
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsync(async (req,res,next)=>{ // catchAsync is the wrapper function used for error handling
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    // const campgroundSchema = Joi.object({ // We use Joi to validate the incoming payload accoring to the defined schema
    //     campground: Joi.object({
    //         title: Joi.string().required(),
    //         price: Joi.number().required().min(0),
    //         image: Joi.string().required(),
    //         location: Joi.string.required(),
    //         description: Joi.string().required()
    //     }).required()
    // })

    // const {error} = campgroundSchema.validate(req.body);

    // if(error){
    //     const msg = error.details.map(el => el.message).join(','); // We convert the message object into a string
    //     throw new ExpressError(msg, 400);
    // }

    // try{
    const campground = new Campground(req.body.campground); // Because of the name field 
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    // }
    // catch(e){
        // next(e); // Pass the async error to next to handle it -> the newer way is to use a wrapper function
    // }
}));

// Route for viewing the details of individual campgrounds

app.get('/campgrounds/:id', catchAsync(async(req,res) =>{ 
    const campground = await Campground.findById(req.params.id).populate("reviews");
    // console.log(campground);
    res.render('campgrounds/show',{campground});
}));

// Routes for editing the campground entries
// One GET for serving the form and a PUT for updating the database and ridirecting to the camp page 

app.get('/campgrounds/:id/edit', validateCampground, catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}));

app.put('/campgrounds/:id', catchAsync(async (req,res) => {
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.render('campgrounds/show',{campground});
}));

// Route for deleting

app.delete('/campgrounds/:id', catchAsync(async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

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