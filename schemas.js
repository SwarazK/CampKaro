const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({ // We use Joi to validate the incoming payload accoring to the defined schema
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});