// const cloudinary = require('cloudinary').v2;
// const dotenv = require('dotenv');

// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadToCloudinary = async (filePath) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: '3degree-tbs/templates', // Optional folder in Cloudinary
//     });
//     return result.secure_url;
//   } catch (error) {
//     console.error('Cloudinary Upload Error:', error);
//     throw error;
//   }
// };

// module.exports = { cloudinary, uploadToCloudinary };

const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// ✅ DEBUGGING: Check environment variables
// console.log('🔍 Cloudinary Environment Check:');
// console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
// console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
// console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Test configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ CRITICAL: Cloudinary credentials missing!');
  console.error('Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

const uploadToCloudinary = async (filePath) => {
  try {
    // console.log('🔄 Starting Cloudinary upload for:', filePath);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: '3degree-tbs/templates',
    });
    
    // console.log('✅ Cloudinary upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
};

module.exports = { cloudinary, uploadToCloudinary };
