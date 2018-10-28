var express = require("express");
var router = express.Router({mergeParams: true});
var Song = require("../models/songs");
var Review = require("../models/reviews");
var middleware = require("../middleware");

// Reviews Index
router.get("/", function (req, res) {
    Song.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
    }).exec(function (err, song) {
        if (err || !song) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {song: song});
    });
});

// Reviews New
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    // middleware.checkReviewExistence checks if a user already reviewed the song, only one review per user is allowed
    Song.findById(req.params.id, function (err, song) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {song: song});

    });
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    //lookup song using ID
    Song.findById(req.params.id).populate("reviews").exec(function (err, song) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, function (err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add author username/id and associated song to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.song = song;
            //save review
            review.save();
            song.reviews.push(review);
            // calculate the new average review for the song
            song.rating = calculateAverage(song.reviews);
            //save song
            song.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/songs/' + song._id);
        });
    });
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {song_id: req.params.id, review: foundReview});
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Song.findById(req.params.id).populate("reviews").exec(function (err, song) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate song average
            song.rating = calculateAverage(song.reviews);
            //save changes
            song.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/songs/' + song._id);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Song.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, song) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate song average
            song.rating = calculateAverage(song.reviews);
            //save changes
            song.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/songs/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;