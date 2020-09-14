const jwt = require("jsonwebtoken");

const AppError = require("../utils/appError");

module.exports = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    const error = new AppError("Authentication Failed", 401);
    return next(error);
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    const error = new AppError("Authentication Failed", 401);
    return next(error);
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  // I will need to check wheather the user is still available in database.

  return next();
};
