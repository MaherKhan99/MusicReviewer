var express = require("express");
var app = express();
app.set("view engine", "ejs");
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
mongoose.connect("mongodb://localhost:27017/music_app",  { useNewUrlParser: true });
var Song = require("./models/songs");
var Comment = require("./models/comments");
var seedDB = require("./seeds");
var songRoutes = require("./routes/songs");
var commentRoutes = require("./routes/comments");
var authRoutes = require("./routes/auth");
var reviewRoutes = require("./routes/reviews");
var methodOverride = require("method-override");
var flash = require("connect-flash");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//seedDB();

app.use(require("express-session")({
    secret: "Yikes",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/songs", songRoutes);
app.use("/songs/:id/comments", commentRoutes);
app.use(authRoutes);
app.use("/songs/:id/reviews", reviewRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Music App server has started!");
})
