const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return next(
      new AppError(
        "This email already has a valid account. Please use another email.",
        409
      )
    );
  }

  user = await User.create({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
  });

  const token = signToken(user.id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      userId: user._id,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      err: "Please provide email and password",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(404).json({
      status: "fail",
      err: "Incorrect email or password!",
    });
  }

  const token = signToken(user.id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      userId: user._id,
    },
  });
});
