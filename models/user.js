const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport"); // Very useful library for adding authentication

const UserSchema = new Schema({
    email:{
        type: String,
        required: true
    }
});

UserSchema.plugin(passportLocalMongoose); // Need to understand this better

module.exports = mongoose.model("User", UserSchema);