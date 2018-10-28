var express = require("express");
var router = express.Router();
var Song = require("../models/songs");
var Comment = require("../models/comments");
var mongoose = require("mongoose");
var middleware = require("../middleware"); //automatically requires index.js in the middlware directory
var Review = require("../models/reviews");
mongoose.set('useFindAndModify', false);

router.get("/", function(req, res){
    Song.find({}, function(err, allSongs){
        if(err){
            console.log(err);
        } else {
            res.render("songs/index", {songs : allSongs, page: 'songs'});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var artist = req.body.artist;
    var image = req.body.image;
    var album = req.body.album;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newSong = {name: name, artist: artist, image: image, album: album, author: author};
    Song.create(newSong, function(err, newSong){ //instead of pushing on to an array, we save it to db
        if(err){
            console.log(err);
        } else {
            console.log(newSong.name);
             res.redirect("/songs");
        }
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("songs/new");
});

router.get("/:id", function (req, res) {
    //find the song with provided ID
    Song.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundSong) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that song
            res.render("songs/show", {song: foundSong});
        }
    });
});


router.get("/:id/edit", middleware.checkSongOwnership, function(req, res) {
    Song.findById(req.params.id, function(err, foundSong){
        res.render("songs/edit", {song: foundSong});
    });
});

router.put("/:id", middleware.checkSongOwnership, function(req, res){
    Song.findByIdAndUpdate(req.params.id, req.body.song, function(err, updatedSong){
        if(err){
            res.redirect("/songs");
        } else {
            res.redirect("/songs/" + req.params.id);
        }
    });
});

// DESTROY song ROUTE
router.delete("/:id", middleware.checkSongOwnership, function (req, res) {
    Song.findById(req.params.id, function (err, song) {
        if (err) {
            res.redirect("/songs");
        } else {
            // deletes all comments associated with the song
            Comment.deleteMany({"_id": {$in: song.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/songs");
                }
                // deletes all reviews associated with the song
                Review.deleteMany({"_id": {$in: song.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/songs");
                    }
                    //  delete the song
                    song.remove();
                    req.flash("success", "Song deleted successfully!");
                    res.redirect("/songs");
                });
            });
        }
    });
});

module.exports = router;