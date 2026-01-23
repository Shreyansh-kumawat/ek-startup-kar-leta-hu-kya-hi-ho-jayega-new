// Backend\middleware\uploadMiddleware.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary } = require('../config/cloudinary'); // ✅ Import cloudinary

// Keep local uploads as backup (optional)
const uploadsDir = path.join(__dirname, '../uploads');
const templatesDir = path.join(uploadsDir, 'templates');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // console.removed.log('📸 File upload attempt:', file.originalname, file.mimetype);
  
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// ✅ FIXED: Upload to Cloudinary instead of local
const compressAndUploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    // console.removed.log('🔄 Compressing and uploading to Cloudinary:', req.file.originalname);

    // Generate unique filename
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000000);
    const filename = `preview-${timestamp}-${randomNum}.webp`;
    const tempPath = path.join(templatesDir, filename);

    // ✅ Compress image
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ 
        quality: 80,
        effort: 4 
      });

    // ✅ Save temporarily for Cloudinary upload
    await compressedBuffer.toFile(tempPath);

    // ✅ Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(tempPath);
    
    // ✅ Add cloudinary URL to request (THIS IS THE KEY!)
    req.file.filename = filename;
    req.file.path = cloudinaryUrl; // ← Database me ye save hoga
    req.file.cloudinaryUrl = cloudinaryUrl;
    req.file.destination = templatesDir;
    req.file.compressedPath = tempPath;

    // console.removed.log('✅ Image uploaded to Cloudinary:', cloudinaryUrl);

    // ✅ Cleanup local temp file
    setTimeout(() => {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        // console.removed.log('🗑️ Cleaned up temp file:', filename);
      }
    }, 5000); // Delete after 5 seconds

    next();
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    
    // Cleanup on error
    const tempPath = path.join(templatesDir, `preview-${Date.now()}-${Math.floor(Math.random() * 10000000)}.webp`);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    
    next(error);
  }
};

// ✅ Combined middleware for cloudinary upload
const uploadImage = [
  upload.single('previewImage'),
  compressAndUploadToCloudinary
];

module.exports = {
  uploadImage,
  upload
};
