var express = require("express");
var router = express.Router();
var Song = require("../models/songs");
var Comment = require("../models/comments");
var mongoose = require("mongoose");
var middleware = require("../middleware"); //automatically requires index.js in the middlware directory
var Review = require("../models/reviews");
var request = require("request");
mongoose.set('useFindAndModify', false);

//renders the index page
router.get("/", function(req, res){
    Song.find({}, function(err, allSongs){
        if(err){
            console.log(err);
        } else {
            res.render("songs/index", {songs : allSongs, page: 'songs'});
        }
    });
});


//adds a new song to the index page
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var artist = req.body.artist;
    var image = req.body.image;
    var album = req.body.album;
    var link = req.body.link.replace("watch?v=", "embed/");
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newSong = {name: name, artist: artist, image: image, album: album, link: link, author: author};
    Song.create(newSong, function(err, newSong){ 
        if(err){
            console.log(err);
        } else {
            res.redirect("/songs");
        }
    });
});

//renders the search form
router.get("/search", function(req, res) {
    res.render("songs/search");
});

//returns results of the search from the itunes search api
router.get("/results", function(req, res){
    var name = req.query.name;
    var url = "https://itunes.apple.com/search?term=" + name;
    request(url, function(error, response, body){
        var data = JSON.parse(body);
        if (!error && response.statusCode == 200){
            res.render("songs/results", {data: data, name : name});
        }
    });
});

//renders the new song form
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("songs/new");
});

//show page for a specific song
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

//renders the edit song form
router.get("/:id/edit", middleware.checkSongOwnership, function(req, res) {
    Song.findById(req.params.id, function(err, foundSong){
        res.render("songs/edit", {song: foundSong});
    });
});

//
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