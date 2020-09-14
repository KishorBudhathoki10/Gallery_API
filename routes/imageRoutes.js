const express = require("express");

const imageController = require("../controllers/imageController");
const checkAuth = require("../middleware/checkAuth");

const router = express.Router();

router
  .route("/")
  .get(imageController.getAllImages)
  .post(imageController.uploadImage, imageController.createImage);

router
  .route("/:id")
  .get(imageController.getImage)
  .patch(imageController.uploadImage, imageController.updateImage)
  .delete(imageController.deleteImage);

module.exports = router;
