// Route for handling users and user authentication
const express = require("express");
const { request } = require("https");
const passport = require("passport");
const { nextTick } = require("process");
const router = express.Router();
const User =  require("../models/user");
const catchAsync = require("../utils/catchAsync");

router.get("/register", (req,res) => { // Route to render the empty form
    res.render("users/register");
})

// app.get('/fakeUser', async (req,res) => {
//     const user = new User({email : "dummy@gmail.com", username : "dumdum"});
//     const newUser = await User.register(user, "chicken"); // We input an User object and a password, the hasing and storing is done by passport
//     res.send(newUser);
// })

router.post("/register", catchAsync(async (req,res,next) =>{ // Route to submit the form to create a new user
    try{
        const {email, username, password} = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser,err => { // Passport middleware that is called automatically by authenticate_user, used to login the specified user
            if(err) return next(err);
            req.flash("Welcome to Yelp Camp!");
            res.redirect("/campgrounds");
        })
    }
    catch(e){
        req.flash("error", e.message);
        res.redirect("register");
    }
}));

// Route for loggin in, the first to serve the login page and the second to recieve the POST request with the credentials

router.get("/login", (req, res) =>{
    res.render("users/login");
})

router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}),(req, res) =>{ 
    // We use inbuilt middleware from passport to check is the entered credentials are correct or not
    req.flash("success", "Welcome Back!");
    // console.log(req.session.returnTo);
    if(req.session.returnTo){
        const redirectUrl = req.session.returnTo;
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
    else{
        res.redirect("/campgrounds");
    }
   
})

// Route to logout the current user
// req.user has information about the current user, it is created automatically by passport
router.get("/logout", (req,res) => {
    req.logout( err => {
        if(err){return next(err)};
        req.flash("success", "Logged out successfully!");
        res.redirect("/campgrounds");
    });
})

module.exports = router;