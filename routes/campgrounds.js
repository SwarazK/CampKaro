const express = require("express");
const router = express.Router();
const multer = require("multer");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require('../utils/ExpressErrors');
const {storage} = require("../cloudinary/index")
const upload = multer({storage});

const Campground = require('../models/campgrounds');

const campgrounds = require("../controllers/campgrounds");

const {isLoggedIn, validateCampground, isAuthor} = require("../middleware");

//*********************************************************************//
//                         Campground Routes                           //
//*********************************************************************//

// router.get('/makecampground', async (req,res)=>{
//     const camp = new Campground({title : "My Background", description: 'Cheap camping!'});
//     await camp.save(); // Figure out how this method works
//     res.send(camp);
// })

router.get('/',catchAsync(campgrounds.index)); // Route for the main display page of the website

// A form for adding new camps :
// Two routes, a page and a route to access the form using a GET request and then a POST request to update the database and to redirect to the index/main display

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.post('/', isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));

// Route for viewing the details of individual campgrounds

router.get('/:id', catchAsync(campgrounds.showCampground));

// Routes for editing the campground entries
// One GET for serving the form and a PUT for updating the database and ridirecting to the camp page 

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground));

// Route for deleting

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;