const mongoose = require("mongoose");
const Review = require("./reviews");
const Schema =  mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function(campground){ // Using mongoose middleware to delete the associated reviews when a campground is deleted
    // console.log(campground);
    if(campground){
        await Review.deleteMany({
            _id:{
                $in: campground.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);