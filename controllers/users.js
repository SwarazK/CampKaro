const User =  require("../models/user");

module.exports.renderRegister = (req,res) => { 
    res.render("users/register");
}

module.exports.register = async (req,res,next) =>{ // Route to submit the form to create a new user
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
}

module.exports.renderLogin = (req, res) =>{
    res.render("users/login");
}

module.exports.login = (req, res) =>{ 
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
   
}

module.exports.logout =  (req,res) => {
    req.logout( err => {
        if(err){return next(err)};
        req.flash("success", "Logged out successfully!");
        res.redirect("/campgrounds");
    });
}