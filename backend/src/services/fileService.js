/**
 * File Service — wraps S3 operations with graceful fallback when S3 is not configured.
 */
const { cache } = require("../config/redis");
const { getPresignedUrl, deleteFromS3, getSignedUploadUrl } = require("../config/s3");
const logger = require("../utils/logger");

const getFileUrl = async (s3Key, cacheKey) => {
  if (!s3Key) return null;
  const cacheId = cacheKey || `url:${s3Key}`;
  try {
    const cached = await cache.get(cacheId);
    if (cached) return cached;
    const url = await getPresignedUrl(s3Key, 3600);
    if (url) await cache.set(cacheId, url, 3000);
    return url;
  } catch (err) {
    logger.error("File URL generation failed:", err.message);
    return null;
  }
};

const deleteFile = async (s3Key) => {
  if (!s3Key) return;
  try {
    await deleteFromS3(s3Key);
  } catch (err) {
    logger.error("File deletion failed:", err.message);
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

module.exports = { getFileUrl, deleteFile, formatFileSize, getSignedUploadUrl };
