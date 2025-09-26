// server/src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ADD VALIDATION
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing!');
  console.error('Check your .env file for:');
  console.error('- CLOUDINARY_CLOUD_NAME');
  console.error('- CLOUDINARY_API_KEY'); 
  console.error('- CLOUDINARY_API_SECRET');
}

cloudinary.config({
  cloud_name: cloudName || 'dummy', // Use dummy to avoid crashes
  api_key: apiKey || 'dummy',
  api_secret: apiSecret || 'dummy',
});

console.log('Cloudinary Configured:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? '***' : 'Not Set',
  api_secret: cloudinary.config().api_secret ? '***' : 'Not Set',
});

// ADD TEST FUNCTION
export const testCloudinary = async () => {
  try {
    if (cloudName && apiKey && apiSecret) {
      const result = await cloudinary.api.ping();
      console.log('✅ Cloudinary connection test passed');
      return true;
    } else {
      console.log('⚠️ Cloudinary not configured - running in local mode');
      return false;
    }
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:', error);
    return false;
  }
};

export default cloudinary;