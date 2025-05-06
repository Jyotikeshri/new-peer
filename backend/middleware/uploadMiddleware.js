// middleware/uploadMiddleware.js
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'peer-groups', // The folder in Cloudinary where images will be stored
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, crop: 'limit' }], // Resize images to a maximum width of 1000px
    format: async (req, file) => {
      // Keep the original format
      if (file.mimetype === 'image/jpeg') return 'jpg';
      if (file.mimetype === 'image/png') return 'png';
      if (file.mimetype === 'image/gif') return 'gif';
      return 'jpg'; // Default format
    },
    public_id: (req, file) => {
      // Generate a unique filename based on current timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileType = file.fieldname === 'avatar' ? 'avatar' : 'cover';
      return `group-${fileType}-${uniqueSuffix}`;
    }
  }
});

// Filter only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create upload middleware
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Max 2 files (avatar and cover)
  }
});

// Middleware function for group file uploads
export const groupUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

// Helper function to delete an image from Cloudinary
export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image ${publicId} from Cloudinary`);
  } catch (error) {
    console.error(`Error deleting image ${publicId} from Cloudinary:`, error);
  }
};

export default { groupUpload, deleteCloudinaryImage };