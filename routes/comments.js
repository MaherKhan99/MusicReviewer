var express = require("express");
var router = express.Router({mergeParams: true});
var Song = require("../models/songs");
var Comment = require("../models/comments");
var middleware = require("../middleware");

//render new comment form
router.get("/new", middleware.isLoggedIn, function(req, res){
    Song.findById(req.params.id, function(err, song){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {song: song});
        }
    });

});

//posts a comment to the associated campground
router.post("/", middleware.isLoggedIn, function(req, res){
    Song.findById(req.params.id, function(err, song){
        if(err){
            console.log(err);
            res.redirect("/songs");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    song.comments.push(comment);
                    song.save();
                    req.flash("success", "Successfully created comment");
                    res.redirect("/songs/" + song._id);
                }
            });
        }
    });
});


//renders the edit comment form
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
             res.render("comments/edit", {song_id: req.params.id, comment: foundComment});
        }
    });
});

//edits a comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/songs/" + req.params.id);
        }
    });
});

//destroys a comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Successfully deleted comment");
            res.redirect("/songs/" + req.params.id);
        }
    });
});


module.exports = router;
