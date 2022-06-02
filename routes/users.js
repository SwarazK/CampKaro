// Route for handling user authentication
const express = require("express");
const passport = require("passport");
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

router.post("/register", catchAsync(async (req,res) =>{ // Route to submit the form to create a new user
    try{
        const {email, username, password} = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.flash("Welcome to Yelp Camp!");
        res.redirect("/campgrounds");
    }
    catch(e){
        req.flash("error", e.message);
        res.redirect("register");
    }
}));

router.get("/login", (req, res) =>{
    res.render("users/login");
})

router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}),(req, res) =>{
    req.flash("success", "Welcome Back!");
    res.redirect("/campgrounds");
})

module.exports = router;