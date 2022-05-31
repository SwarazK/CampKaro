const express = require('express');
const path = require('path'); // To dynamically set the paths
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const ExpressError = require('./utils/ExpressErrors');


const campgrounds = require("./routes/campgrounds");
const reviews = require('./routes/reviews');


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
app.use(express.static("public")); // For setting the path of serving static assets

const sessionConfig ={
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7, // Set to expire in a week
        maxAge: 1000*60*60*24*7
    }
};
app.use(session(sessionConfig));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use("/campgrounds/:id/reviews", reviews);
app.use("/campgrounds", campgrounds); // Pass all requests starting with /campgrounds to the campgrounds route

app.get('/',(req,res)=>{ // Route for the home page of the website
    res.render('home');
});

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