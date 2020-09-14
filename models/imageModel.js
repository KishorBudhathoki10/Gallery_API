const mongoose = require("mongoose");
const validator = require("validator");

const imageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Image must have a title."],
      minlength: [3, "Image must have a title name at least of 3 character."],
      maxlength: [15, "Image title can only have maximum of 15 character."],
    },
    price: {
      type: Number,
      required: [true, "Price must be provided."],
      min: [0.01, "Price should be greater than 0."],
      max: [5000, "Price should be less than or equal to 5000."],
    },
    imageUrl: {
      type: String,
      required: [true, "Please upload an image."],
      validate: [validator.isURL, "ImageUrl must be a url."],
    },
    description: {
      type: String,
      trim: true,
      minlength: [20, "Description must be minimum of 20 characters."],
      maxlength: [600, "Description cannot be more than 600 characters long."],
    },
    discount: {
      type: Number,
      default: 0,
    },
    photoBy: {
      type: String,
      trim: true,
      required: [true, "Photographers name is must."],
    },
  },
  { timestamps: true }
);

imageSchema.pre("save", function (next) {
  this.price = this.price.toFixed(2);
  this.discount = this.discount.toFixed(2);
  next();
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
