const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    required: [true, "You must provide your first name."],
    minlength: [2, "First name must contain minimum of 2 characters."],
    maxlength: [30, "First name must contain less than 30 characters."],
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, "You must provide your last name."],
    minlength: [2, "First name must contain minimum of 2 characters."],
    maxlength: [30, "First name must contain less than 30 characters."],
  },
  profileImageUrl: {
    type: String,
    trim: true,
    validate: [validator.isURL, "profileImageUrl must be a URL."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email."],
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    minlength: [8, "Password must have a minimum of 8 characters."],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password."],
    validate: {
      // This only works on SAVE!!
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords are not the same.",
    },
  },
  cart: [
    {
      imageId: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],

  cart: {
    // items:[String] // if we want array of string
    items: [
      {
        imageId: {
          type: Schema.Types.ObjectId, // to use ObjectId type we need to leverage Schema.Types
          ref: "Image",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    totalItems: {
      type: Number,
      default: 0,
    },
  },
});

// Only runs before save or create
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  checkPassword,
  originalPassword
) {
  return await bcrypt.compare(checkPassword, originalPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
