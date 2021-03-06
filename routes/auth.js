var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//renders register form
router.get("/register", function(req, res) {
    res.render("register", {page: 'register'});
});

//registers a user 
router.post("/register", function(req, res){
    var newUser =new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Yelp Camp " + user.username);
            res.redirect("/songs");
        });
    });
});

//renders landing page
router.get("/", function(req, res){
    res.render("landing");
});

//renders login form
router.get("/login", function(req, res) {
    res.render("login", {page: 'login'});
});

//logs a user in
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/songs",
        failureRedirect: "/login"
    }), function(req, res){
});

//logs a user out
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/songs");
});


module.exports = router;