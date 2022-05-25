const express = require('express');
const path = require('path'); // To dynamically set the paths
const mongoose = require('mongoose');
const Campground = require('./models/campgrounds');
const methodOverride = require('method-override');
const { allowedNodeEnvironmentFlags } = require('process');
const ejsMate = require("ejs-mate");

mongoose.connect('mongodb://localhost:27017/camp-karo',{ // Why those three properties are specified
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database Connected");
})

const app  = express();

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.urlencoded({extended : true})); // For parsing the input from the forms
app.use(methodOverride('_method')); // For getting requests other than GET and POST from forms

app.get('/',(req,res)=>{ // Route for the home page of the website
    res.render('home');
})

// app.get('/makecampground', async (req,res)=>{
//     const camp = new Campground({title : "My Background", description: 'Cheap camping!'});
//     await camp.save(); // Figure out how this method works
//     res.send(camp);
// })

app.get('/campgrounds', async(req,res) =>{ // Route for the main display page of the website
    const campgrounds = await Campground.find({}); // Finds ans retrieves all the campgrounds from the DB
    res.render('campgrounds/index', {campgrounds}); // The retrieved campgrounds are passed to the ejs file as an object
});

// A form for adding new camps :
// Two routes, a page and a route to access the form using a GET request and then a POST request to update the database and to redirect to the index/main display

app.get('/campgrounds/new',(req,res) =>{
    res.render('campgrounds/new');
})

app.post('/campgrounds', async (req,res)=>{
    const campground = new Campground(req.body.campground); // Because of the name field 
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

// Route for viewing the details of individual campgrounds

app.get('/campgrounds/:id', async(req,res) =>{ 
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show',{campground});
});

// Routes for editing the campground entries
// One GET for serving the form and a PUT for updating the database and ridirecting to the camp page 

app.get('/campgrounds/:id/edit', async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
})

app.put('/campgrounds/:id', async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.render('campgrounds/show',{campground});
})

app.delete('/campgrounds/:id', async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, ()=>{
    console.log('Listening on port 3000');
}) 