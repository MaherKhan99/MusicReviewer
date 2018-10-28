var mongoose = require("mongoose");
var Song = require("./models/songs");
var Comment = require("./models/comments")

var data = [
    {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "blah blah blah"
    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "blah blah blah"
    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "blah blah blah"
    }
];


function seedDB(){
        Song.deleteMany({}, function(err, removedSong){
        if(err){
            console.log(err);
        } else {
            console.log("removed song");
            data.forEach(function(seed){
                Song.create(seed, function(err, song){
                    if(err){
                        console.log(err);
                    } else {
                        console.log("Added a song");
                        Comment.create({text: "This place is great", author: "Homer"}, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                song.comments.push(comment);
                                song.save();
                                console.log("created new comment");
                            }
                        });
                    }
                });
            });
        }
    });
}

module.exports = seedDB;