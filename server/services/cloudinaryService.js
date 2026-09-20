const cloudinary = require('../config/cloudinary');
const config = require('../config/env');

async function uploadImageStream(buffer) {
  // Check if credentials exist
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    console.warn('[Cloudinary] Missing credentials in .env. Skipping cloud upload.');
    return { url: '', publicId: '' };
  }

  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'sparq_fireworks', format: 'webp', quality: 'auto' },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]:', error.message);
            return resolve({ url: '', publicId: '' }); // Don't crash Express
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      uploadStream.on('error', (err) => {
        console.error('[Cloudinary Stream Error]:', err.message);
        resolve({ url: '', publicId: '' });
      });

      uploadStream.end(buffer);
    } catch (err) {
      console.error('[Cloudinary Exception]:', err.message);
      resolve({ url: '', publicId: '' });
    }
  });
}

async function deleteImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`[Cloudinary Delete Error]: ${publicId}`, err.message);
  }
}

module.exports = { uploadImageStream, deleteImage };