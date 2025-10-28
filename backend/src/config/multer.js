const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if we're running on DigitalOcean App Platform
const isDigitalOcean = process.env.NODE_ENV === 'production' && process.env.DB_HOST && process.env.DB_HOST.includes('ondigitalocean.com');

let storage;

if (isDigitalOcean) {
  console.log('🌊 Running on DigitalOcean - using memory storage for file uploads');
  // Use memory storage for DigitalOcean App Platform
  storage = multer.memoryStorage();
} else {
  console.log('💻 Running locally - using disk storage for file uploads');
  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Created uploads directory:', uploadDir);
    } catch (error) {
      console.error('❌ Failed to create uploads directory:', error);
      throw error;
    }
  } else {
    console.log('✅ Uploads directory exists:', uploadDir);
  }

  // Configure disk storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename: timestamp-randomstring-originalname
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
    }
  });
}

// File filter
const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: images, PDF, Word, Excel, PowerPoint, text, and ZIP files.'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 5242880) // Default 5MB
  }
});

module.exports = upload;

