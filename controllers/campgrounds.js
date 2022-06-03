const Campground = require('../models/campgrounds');

module.exports.index = async(req,res) =>{ // Route for the main display page of the website
    const campgrounds = await Campground.find({}); // Finds ans retrieves all the campgrounds from the DB
    res.render('campgrounds/index', {campgrounds}); // The retrieved campgrounds are passed to the ejs file as an object
}

module.exports.renderNewForm = (req,res) =>{
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req,res,next)=>{ // catchAsync is the function used for error handling
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
    campground.author = req.user._id; // To add the current user as the author of the campground
    await campground.save();
    
    res.redirect(`/campgrounds/${campground._id}`);
    // }
    // catch(e){
        // next(e); // Pass the async error to next to handle it -> the newer way is to use a wrrouterer function
    // }
}

module.exports.showCampground = async(req,res) =>{ 
    const campground = await Campground.findById(req.params.id).populate({ 
       path: "reviews",
       populate:{
           path: "author"       // A nested populate, here we first populate the author of the reviews, then we populate the riviews in the campground
       }
    }).populate("author");
    // console.log(campground);
    if(!campground){
        req.flash("error", "Cannot find the campground!");
        res.redirect("/campground");
    }
    res.render('campgrounds/show',{campground});
}

module.exports.renderEditForm = async (req,res)=>{
    const campground = await Campground.findById(req.params.id);

    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req,res) => {
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const {id} = req.params;

    await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const campground = await Campground.findById(req.params.id).populate({ 
        path: "reviews",
        populate:{
            path: "author"       // A nested populate, here we first populate the author-names of the reviews, then we populate the riviews in the campground
        }
     }).populate("author");
    req.flash("success", "Successfully updated campground");
    res.render('campgrounds/show',{campground});
}

module.exports.deleteCampground = async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(req.params.id);

    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
} 