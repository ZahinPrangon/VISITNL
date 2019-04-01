var express = require("express");
var router = express.Router({mergeParams: true});
var Place = require("../models/place");
var Comment = require("../models/comment");
var middleware = require("../middleware");
const { isLoggedIn, checkUserComment, isAdmin } = middleware;

// ===========================
// COMMENTS ROUTES
// ===========================

//lookup the place using id
router.post("/", isLoggedIn, function(req,res){
    //lookup place using ID
    Place.findById(req.params.id, function(err, place){
        if(err){
            console.log(err);
            res.redirect("/places");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;           
                    //save comment
                    comment.save();
                    place.comments.push(comment);
                    place.save();
                    console.log("Here is the comment!!!!!!!!");
                    console.log(comment);
                    req.flash('success', 'Created a comment!');
                    res.redirect('/places/' + place._id);
                }
            });
        }
    });
});

router.put("/:commentId", function(req, res){
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
        if(err){
           console.log(err);
            res.render("edit");
        } else {
            res.redirect("/places/" + req.params.id);
        }
    }); 
 });


router.delete("/:commentId", isLoggedIn, checkUserComment, checkUserComment, function(req, res){
    // find place, remove comment from comments array, delete comment in db
    Place.findByIdAndUpdate(req.params.id, {
      $pull: {
        comments: req.comment.id
      }
    }, function(err) {
      if(err){ 
          console.log(err);
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.comment.remove(function(err) {
            if(err) {
              req.flash('error', err.message);
              return res.redirect('/');
            }
            req.flash('error', 'Comment deleted!');
            res.redirect("/places/" + req.params.id);
          });
      }
    });
  });

// //middleware to check if user is logged in
// function isLoggedIn(req,res,next) {
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/login");
// }

// function checkUserComment(req, res, next){
//     Comment.findById(req.params.commentId, function(err, foundComment){
//        if(err || !foundComment){
//            console.log(err);
//            res.redirect('/places');
//        } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
//             req.comment = foundComment;
//             next();
//        } else {
//            res.redirect('/places/' + req.params.id);
//        }
//     });
// }

module.exports = router;