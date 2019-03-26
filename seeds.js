var mongoose = require("mongoose");
var Place = require("./models/place");
var Comment   = require("./models/comment");
 
var data = [
    {
        name: "Cape Spear", 
        image: "https://drscdn.500px.org/photo/114314407/m%3D900/7ae2994ec5338f1536ffa068aeb3963d",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },

    {
        name: "Ferryland",
        image: "https://cdn.artfunnels.com/b30e38de-1343-42f7-9138-8c359af251c5/",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Gros Morne National Park",
        image: "https://www.newfoundlandlabrador.com/-/media/marquees/top-destinations/gros-morne/gros-morne/gros-morne-main-header.jpg?mh=960&mw=1280&hash=8B1B322BA241C880F9579E4CD399A9886AAA9E01",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"

    }

];

function seedDB(){
   //Remove all places
   Place.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed places!");
        Comment.remove({}, function(err) {
            if(err){
                console.log(err);
            }
            console.log("removed comments!");
             //add a few places
            data.forEach(function(seed){
                Place.create(seed, function(err, place){
                    if(err){
                        console.log(err);
                    } else {
                        console.log("added a place");
                        //create a comment
                        Comment.create(
                            {
                                text: "This place is great, but I wish there was internet",
                                author: "Homer"
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else {
                                    place.comments.push(comment);
                                    place.save();
                                    console.log("Created new comment");
                                }
                        });
                    }
                });
            });
        });
    }); 
    //add a few comments
}
 
module.exports = seedDB;