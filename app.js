var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    methodOverride = require("method-override"),
    passport   = require("passport"),
    localStrategy = require("passport-local"),
    User       = require("./models/user"),
    seedDB     = require("./seeds");

// configure dotenv
// var dotenv = require('dotenv');
// dotenv.load();

require('dotenv').config();
// var dotenv = require('dotenv').config({path: path.join(process.env.GMAILPW, '.env')});

// Declaring all the routes here
var commentRoutes = require("./routes/comments"),
    placesRoutes  = require("./routes/places"),
    authRoutes    = require("./routes/auth");

mongoose.connect("mongodb://localhost/visitNL", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.locals.moment = require('moment');
// seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "You are the best",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

app.use("/", authRoutes);
app.use("/places", placesRoutes);
app.use("/places/:id/comments", commentRoutes);



app.listen(4000, function(){
    console.log("Server started on port 4000 ");
});