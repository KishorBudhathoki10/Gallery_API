const multer = require("multer");
const multerS3 = require("multer-s3");

const { s3 } = require("../utils/awsFeatures");

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid Image Type, only JPEG, JPG and PNG are accepted.",
        false
      )
    );
  }
};

const upload = multer({
  fileFilter: fileFilter,
  limits: { fileSize: 2000000 },
  storage: multerS3({
    dest: "Images",
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    key: function (req, file, cb) {
      const newFileName = Date.now().toString() + "-" + file.originalname;
      const fullPath = "images/" + newFileName;
      cb(null, fullPath);
    },
  }),
});

module.exports = upload;
