const Image = require("../models/imageModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const aws = require("aws-sdk");

const { s3, deleteImageFromAWS } = require("../utils/awsFeatures");
const upload = require("../services/image-upload");

const singleUpload = upload.single("image");

const deleteImage = (imageUrl) => {
  const imageName = imageUrl.split("/")[imageUrl.split("/").length - 1];
  const imagePath = "images/" + imageName;

  deleteImageFromAWS(s3, process.env.S3_BUCKET_NAME, imagePath);
};

exports.getAllImages = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Image.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const images = await features.query;

  res.status(200).json({
    status: "success",
    results: images.length,
    data: {
      images,
    },
  });
});

let userId;

exports.uploadImage = (req, res, next) => {
  if (req.body.userId) {
    userId = req.body.userId;
  }

  singleUpload(req, res, function (err) {
    if (err) {
      return next(new AppError(err.message, 422));
    }

    return next();
  });
};

exports.createImage = (req, res, next) => {
  // Note: req.body is empty file is being uploaded to aws but other things are not working

  const { title, price, description, discount, photoBy } = req.body;

  let descriptionToSave = null;

  if (description !== "") {
    descriptionToSave = description;
  }

  if (!req.file) {
    return next(new AppError("Image is required. Please upload a image."), 422);
  }
  const imageUrl = req.file.location;

  Image.create({
    title,
    price,
    description: descriptionToSave,
    discount,
    photoBy,
    imageUrl,
    userId,
  })
    .then((image) => {
      res.status(201).json({
        status: "success",
        data: {
          image,
        },
      });
    })
    .catch((err) => {
      deleteImage(imageUrl);

      return next(new AppError(err, 422));
    });
};

exports.getImage = catchAsync(async (req, res, next) => {
  const image = await Image.findById(req.params.id);

  if (!image) {
    return next(new AppError("No image found with that ID.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      image,
    },
  });
});

exports.updateImage = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  Image.findById(id)
    .then((image) => {
      let imageUrl;

      if (!image) {
        imageUrl = req.file.location;

        deleteImage(imageUrl);

        return next(new AppError("No image found with that ID.", 404));
      }

      if (req.file) {
        imageUrl = image.imageUrl;

        deleteImage(imageUrl);

        req.body.imageUrl = req.file.location;
      }

      const body = req.body;

      Object.keys(body).forEach((key) => {
        image[key] = body[key];
      });

      image
        .save()
        .then((updatedImage) => {
          res.status(200).json({
            status: "success",
            data: {
              image: updatedImage,
            },
          });
        })
        .catch((err) => {
          return next(new AppError(err));
        });
    })
    .catch((err) => {
      const imageUrl = req.file.location;

      deleteImage(imageUrl);

      const message = `Invalid ${err.path}: ${err.value}.`;

      return next(new AppError(message, 400));
    });
});

exports.deleteImage = catchAsync(async (req, res, next) => {
  const image = await Image.findByIdAndDelete(req.params.id);

  if (!image) {
    return next(new AppError("No image found with that ID.", 404));
  }

  deleteImage(image.imageUrl);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
