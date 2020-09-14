const aws = require("../config/awsConfig");

exports.s3 = new aws.S3();

exports.deleteImageFromAWS = (s3, bucketName, path) => {
  return s3.deleteObject(
    {
      Bucket: bucketName,
      Key: path,
    },
    function (err, data) {}
  );
};
