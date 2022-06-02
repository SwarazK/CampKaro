module.exports.isLoggedIn = (req, res, next) =>{ // Used to check if a user is logged in or not
    if(!req.isAuthenticated()){ // isAuthenticated is provided by passport
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
}