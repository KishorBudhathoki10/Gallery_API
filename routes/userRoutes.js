const express = require("express");

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const checkAuth = require("../middleware/checkAuth");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

// router.get("/", userController.getAllUsers);

router
  .route("/:id")
  .get(checkAuth, userController.getUser)
  .patch(userController.updateUser);

router.route("/:id/images").get(checkAuth, userController.getUserImages);

router.post(
  "/:id/profileImage",
  checkAuth,
  userController.validUser,
  userController.uploadProfileImage
);

module.exports = router;
