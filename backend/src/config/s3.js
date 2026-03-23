/**
 * S3 Configuration
 * Returns stub implementations when AWS credentials are not set.
 * Configure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET in .env to enable real S3.
 */
const logger = require("../utils/logger");

let s3Client = null;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET) {
  try {
    const AWS = require("aws-sdk");
    s3Client = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || "ap-south-1",
    });
    logger.info("✅  AWS S3 configured");
  } catch (err) {
    logger.warn("⚠️  AWS SDK not available — file uploads will be disabled");
  }
} else {
  logger.info("ℹ️  AWS S3 not configured — file uploads disabled (set AWS_ACCESS_KEY_ID and AWS_S3_BUCKET to enable)");
}

const getPresignedUrl = async (key, expiresIn = 3600) => {
  if (!s3Client) return null;
  return new Promise((resolve, reject) => {
    s3Client.getSignedUrl("getObject", {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn,
    }, (err, url) => (err ? reject(err) : resolve(url)));
  });
};

const deleteFromS3 = async (key) => {
  if (!s3Client) return;
  return new Promise((resolve, reject) => {
    s3Client.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    }, (err) => (err ? reject(err) : resolve()));
  });
};

const getSignedUploadUrl = async (fileName, fileType, userId) => {
  if (!s3Client) throw new Error("S3 not configured");
  const key = `records/${userId}/${Date.now()}_${fileName}`;
  const url = await new Promise((resolve, reject) => {
    s3Client.getSignedUrl("putObject", {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: fileType,
      Expires: 300,
    }, (err, u) => (err ? reject(err) : resolve(u)));
  });
  return { url, key };
};

module.exports = { s3Client, getPresignedUrl, deleteFromS3, getSignedUploadUrl };
