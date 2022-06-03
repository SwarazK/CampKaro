// Route for handling users and user authentication
const express = require("express");
const passport = require("passport");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

const users = require("../controllers/users");
const user = require("../models/user");

// Route to render the empty form
router.get("/register", users.renderRegister);

// app.get('/fakeUser', async (req,res) => {
//     const user = new User({email : "dummy@gmail.com", username : "dumdum"});
//     const newUser = await User.register(user, "chicken"); // We input an User object and a password, the hasing and storing is done by passport
//     res.send(newUser);
// })

// Route to submit the form to create a new user
router.post("/register", catchAsync(users.register));

// Route for loggin in, the first to serve the login page and the second to recieve the POST request with the credentials

router.get("/login", users.renderLogin);

router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), users.login);

// Route to logout the current user
// req.user has information about the current user, it is created automatically by passport
router.get("/logout", users.logout)

module.exports = router;