var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Place = require("../models/place");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

// This is the main get page for the application
router.get("/", function(req, res){
    res.render("landing");
});

// ===========
// AUTH ROUTES
// ============

// SHOW REGISTER FORM 
router.get("/register", function(req,res){
    res.render("register");
});

//HANDLE SIGN UP LOGIC
router.post("/register", function(req,res){
   var newUser = new User(
       {username: req.body.username, 
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,        
    });
    console.log(newUser);
   if(req.body.adminCode === 'iamadmin123') {
       newUser.isAdmin = true;
   }   
   User.register(newUser, req.body.password, function(err, user){
       if(err) {
           console.log(err);
           return res.render("register");
       }
       passport.authenticate("local")(req, res, function(){
        req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
        res.redirect("/places");
       });
   });
});


// ===========
// LOGIN ROUTES
// ============


//show login form
router.get("/login", function(req,res){
    res.render("login", {message: req.flash("error")});
});

//handling login logic
router.post("/login", passport.authenticate("local",
    {
    successRedirect: "/places",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: 'Welcome to VISITNL!'
    }), function (req, res) {

});

//logout route
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/places");
});

// RENDER THE FORGOT PAGE
router.get("/forgot", function (req, res) {
    res.render("forgot");
});


//ROUTE TO POST REQUEST WHEN THE EMAIL IS SUBMIT TO RESET THE PASSWORD
router.post('/forgot', function (req, res, next) {
  console.log("reached here");
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({email: req.body.email}, function (err, user) {
                if (!user) {
                    return res.redirect("/forgot");
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                
                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
               //BOT EMAIL AND PASS
                auth: {
                    user: '****@gmail.com',
                    pass: '*******'
                }
            });
            console.log('reached here as well');
            var mailOptions = {
                to: user.email,
                from: 'visitnl120@gmail.com',
                subject: 'VISITNL password RESET',
                text: 'You are receiving this because you(or someone else) have requested the reset of the password. \n\n' +
                'Please click on the following link, or paste this into your browser to complete the process of reseting your password: \n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                done(err, 'done');
        }); 
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});


router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        console.log('mail2 sent');
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          //BOT EMAIL AND PASS
          auth: {
            user: 'visitnl120@gmail.com',
            pass: 'VISITNL456'
          }
        });
        console.log('mail2 sent');
        var mailOptions = {
          to: user.email,
          from: 'visitnl120@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/places');
    });
  });

  // USER PROFILE
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
      if(err) {
        return res.redirect("/");
      }
      Place.find().where('author.id').equals(foundUser._id).exec(function(err, places) {
        if(err) {
          return res.redirect("/");
        }
        res.render("users/show", {user: foundUser, places: places});
      });
    });
  });
  

// //middleware to check if user is logged in
// function isLoggedIn(req,res,next) {
//     if(req.isAuthenticated()){
//         return next();
//     }
//     req.flash("error", "You need to be logged in to do that");
//     res.redirect("/login");
// }

module.exports = router;
