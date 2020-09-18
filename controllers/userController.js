const User = require("../models/userModel");
const Image = require("../models/imageModel");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");
const upload = require("../services/userProfileImage-upload");
const AppError = require("../utils/appError");

const { s3, deleteImageFromAWS } = require("../utils/awsFeatures");
const singleUpload = upload.single("profileImage");

const deleteImage = (imageUrl, userId) => {
  const imageName = imageUrl.split("/")[imageUrl.split("/").length - 1];

  const imagePath = `users/profile_image/${userId}/` + imageName;

  deleteImageFromAWS(s3, process.env.S3_BUCKET_NAME, imagePath);
};

exports.validUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (user.profileImageUrl) {
    deleteImage(user.profileImageUrl, req.params.id);
  }

  next();
});

exports.uploadProfileImage = (req, res, next) => {
  singleUpload(req, res, function (err) {
    if (err) {
      return next(new AppError(err.message, 422));
    }

    if (!req.file) {
      return next(new AppError("Please provide valid image", 406));
    }

    imageUrl = req.file.location;

    User.findByIdAndUpdate(req.params.id, { profileImageUrl: imageUrl })
      .then((user) => {
        res.status(200).json({
          status: "success",
          data: {
            userProfileUrl: imageUrl,
          },
        });
      })
      .catch((err) => {
        next(new AppError(err.message, 401));
      });
  });
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.body.userId);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getUserImages = catchAsync(async (req, res, next) => {
  const images = await Image.find().where({ userId: req.body.userId });

  res.status(200).json({
    status: "success",
    data: {
      images,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const body = req.body;

  const updateableData = ["firstName", "lastName", "email", "password", "cart"];
  const updateObject = {};

  updateableData.forEach((key) => {
    if (body[key]) {
      updateObject[key] = body[key];
    }
  });

  let total = 0;

  if (body.cart) {
    let items = body.cart.items || [];

    if (items.length > 0) {
      items.forEach((item) => {
        total += item.quantity;
      });

      updateObject.cart.totalItems = total;
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, updateObject, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {});
