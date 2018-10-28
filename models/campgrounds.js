var mongoose = require("mongoose");


//schema setup
var campgroundSchema = new mongoose.Schema({
    name : String,
    price: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//     {
//         name: "Granite Hill", 
//         image:"http://www.suttonfalls.com/communities/4/004/012/498/244//images/4628314067.jpg",
//         description:"This is a huge granite hill. No bathrooms. No water. Beautiful granite"
//     }, 
//     function(err, campground){
//         if(err){
//             console.log (err);
//         } else {
//             console.log("new campground");
//             console.log(campground);
//         }
//     }
// );
    