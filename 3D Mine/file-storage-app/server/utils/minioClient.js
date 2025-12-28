const Minio = require('minio');

// Create MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD
});

// Check if bucket exists, if not create it
const bucketName = process.env.MINIO_BUCKET_NAME || 'filebucket';

async function initializeBucket() {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Bucket '${bucketName}' created successfully`);
    } else {
      console.log(`Bucket '${bucketName}' already exists`);
    }
  } catch (error) {
    console.error(`Error initializing bucket: ${error}`);
  }
}

initializeBucket();

module.exports = {
  minioClient,
  bucketName
};