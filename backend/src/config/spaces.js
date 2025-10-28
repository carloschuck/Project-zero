const { S3Client } = require('@aws-sdk/client-s3');

// Check if we're running on DigitalOcean App Platform with Spaces configured
const isSpacesConfigured = process.env.SPACES_ENDPOINT && 
                           process.env.SPACES_KEY && 
                           process.env.SPACES_SECRET && 
                           process.env.SPACES_BUCKET;

let s3Client = null;

if (isSpacesConfigured) {
  console.log('🌊 Configuring DigitalOcean Spaces for file storage');
  console.log(`📦 Bucket: ${process.env.SPACES_BUCKET}`);
  console.log(`🌐 Region: ${process.env.SPACES_REGION || 'nyc3'}`);
  
  s3Client = new S3Client({
    endpoint: process.env.SPACES_ENDPOINT, // e.g., https://nyc3.digitaloceanspaces.com
    region: process.env.SPACES_REGION || 'nyc3',
    credentials: {
      accessKeyId: process.env.SPACES_KEY,
      secretAccessKey: process.env.SPACES_SECRET,
    },
    forcePathStyle: false, // DigitalOcean Spaces uses virtual-hosted-style
  });
  
  console.log('✅ DigitalOcean Spaces client configured successfully');
} else {
  console.log('💻 Spaces not configured - using local/memory storage');
}

module.exports = {
  s3Client,
  isSpacesConfigured,
  bucket: process.env.SPACES_BUCKET || '',
  region: process.env.SPACES_REGION || 'nyc3',
  endpoint: process.env.SPACES_ENDPOINT || '',
};

