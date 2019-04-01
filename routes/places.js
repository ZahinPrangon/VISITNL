var express = require("express");
var router = express.Router();
var Place = require("../models/place");
var middleware = require("../middleware");
var multer = require('multer');
var { isLoggedIn, checkUserPlace, checkUserComment, isAdmin, isSafe } = middleware; // destructuring assignment



var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dpurin337', 
  api_key:  '294134614461722', 
  api_secret: '0vifpxFvDJKcnEAKRBeJSOeuH9U'
});

//Get all places from db
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
         // Get all place from DB
         Place.find({name: regex}, function(err, allPlaces){
            if(err){
                console.log(err);
            } else {
               if(allPlaces.length < 1) {
                   noMatch = "No place match that query, please try again.";
               }
               res.render("places/index",{places:allPlaces, noMatch: noMatch});
            }
 });     
} else {
    Place.find({}, function(err, allPlaces){
        if(err){
            console.log(err);
        } else {
            res.render("places/index", {places: allPlaces, noMatch: noMatch});
        }
    });
}
});

//get data from form and add to places array
//redirect back to places page
//Create a new place and add to DB
router.post("/", isLoggedIn,  upload.single('image'), function(req,res) {
   
    cloudinary.v2.uploader.upload(req.file.path, function (error, result) {
        console.log(result, error);
        // add cloudinary url for the image to the place object under image property
        req.body.place.image = result.secure_url;
        req.body.place.imageId = result.public_id;
        // add author to place
        req.body.place.author = {
            id: req.user._id,
            username: req.user.username
        };
        Place.create(req.body.place, function (err, place) {
            if (err) {
                // req.flash('error', err.message);
                // return res.redirect('back');
                console.log(err);
            }
            res.redirect('/places/' + place.id);
        });
    });
});

router.get("/new", isLoggedIn, function(req,res){
    res.render("places/new");
});


// find the place with the provided ID
// render show template with that place
router.get("/:id", function(req,res){
    Place.findById(req.params.id).populate("comments").exec(function(err, foundPlace){
        if(err) {
            console.log(err);
            req.flash('error', 'Sorry, that place does not exist!');
            return res.redirect('/places');
        } else {
            console.log(foundPlace);
            res.render("places/show", {place : foundPlace});
        }
    });
});

//EDIT PLACE ROUTE
router.get("/:id/edit", isLoggedIn, checkUserPlace, function(req,res){
    Place.findById(req.params.id, function(err,foundPlace){
      if (err) {
          res.redirect("/places");
      }  else {
        res.render("places/edit", {place: foundPlace});
      }
    });
});

//UPDATE PLACE ROUTE
router.put("/:id", upload.single('image'), function(req,res){
    //find and update the correct place
    Place.findById(req.params.id, async function(err,place){
        if(err){
            res.redirect("/places");
        } else {
            if(req.file) {
                try {
                await cloudinary.v2.uploader.destroy(place.imageId); 
                var result = await cloudinary.v2.uploader.upload(req.file.path);
                place.imageId = result.public_id;
                place.image = result.secure_url;
                } catch(err) {
                    return res.redirect("/places");                    
                }
            }
            place.name = req.body.name;
            place.description = req.body.description;
            place.save();
            res.redirect("/places/" + req.params.id);
        }
    });    
});

router.delete("/:id", function(req,res){
    Place.findById(req.params.id, async function(err, place){
        if(err){
            return res.redirect("/places");
        }
        try{
            await cloudinary.v2.uploader.destroy(place.imageId);
            place.remove();
            res.redirect("/places"); 
        } catch(err) {
            if(err){
               return res.redirect("/places"); 
            }
        }
    });
});

// router.get("/", function (req, res) {
//     var perPage = 8;
//     var pageQuery = parseInt(req.query.page);
//     var pageNumber = pageQuery ? pageQuery : 1;
//     Place.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allPlaces) {
//         Place.count().exec(function (err, count) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 res.render("places/index", {
//                     places: allPlaces,
//                     current: pageNumber,
//                     pages: Math.ceil(count / perPage)
//                 });
//             }
//         });
//     });
// });



function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



//middleware to check if user is logged in
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;