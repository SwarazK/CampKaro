const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require("./cities") // To import the data of the 1000 cities
const {places, decriptors, descriptors} = require("./seedHelpers"); // To import the text to generate the names of the camps

mongoose.connect('mongodb://localhost:27017/camp-karo',{ // Why those three properties are specified
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database Connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});// Resets the database by deleting everything
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:  `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}

seedDB();