const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const ExpressError = require('../utils/ExpressErrors');

const Campground = require('../models/campgrounds');
const {campgroundSchema} = require("../schemas");

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

//*********************************************************************//
//                         Campground Routes                           //
//*********************************************************************//

// router.get('/makecampground', async (req,res)=>{
//     const camp = new Campground({title : "My Background", description: 'Cheap camping!'});
//     await camp.save(); // Figure out how this method works
//     res.send(camp);
// })

router.get('/',catchAsync(async(req,res) =>{ // Route for the main display page of the website
    const campgrounds = await Campground.find({}); // Finds ans retrieves all the campgrounds from the DB
    res.render('campgrounds/index', {campgrounds}); // The retrieved campgrounds are passed to the ejs file as an object
}));

// A form for adding new camps :
// Two routes, a page and a route to access the form using a GET request and then a POST request to update the database and to redirect to the index/main display

router.get('/new',(req,res) =>{
    res.render('campgrounds/new');
});

router.post('/', validateCampground, catchAsync(async (req,res,next)=>{ // catchAsync is the wrrouterer function used for error handling
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
        // next(e); // Pass the async error to next to handle it -> the newer way is to use a wrrouterer function
    // }
}));

// Route for viewing the details of individual campgrounds

router.get('/:id', catchAsync(async(req,res) =>{ 
    const campground = await Campground.findById(req.params.id).populate("reviews");
    // console.log(campground);
    res.render('campgrounds/show',{campground});
}));

// Routes for editing the campground entries
// One GET for serving the form and a PUT for updating the database and ridirecting to the camp page 

router.get('/:id/edit', catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}));

router.put('/:id', validateCampground, catchAsync(async (req,res) => {
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const {id} = req.params;
    await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const campground = await Campground.findById(req.params.id).populate("reviews");
    res.render('campgrounds/show',{campground});
}));

// Route for deleting

router.delete('/:id', catchAsync(async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

module.exports = router;