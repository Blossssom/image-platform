import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

// Create uploads directory if it doesn't exist
const uploadPath = join(process.cwd(), 'uploads');
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

const tempPath = join(uploadPath, 'temp');
if (!existsSync(tempPath)) {
  mkdirSync(tempPath, { recursive: true });
}

// File filter for images
const imageFileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimes.join(', ')}`
      ),
      false
    );
  }
};

// Generate unique filename
const generateFilename = (req: any, file: Express.Multer.File, callback: any) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname);
  callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
};

// Multer configuration for image uploads
export const uploadConfig: MulterOptions = {
  storage: diskStorage({
    destination: tempPath,
    filename: generateFilename,
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files at once
  },
};

// Configuration for different image sizes
export const imageSizeConfig = {
  thumbnail: { width: 300, height: 300, quality: 80 },
  medium: { width: 800, height: 800, quality: 85 },
  large: { width: 1200, height: 1200, quality: 90 },
  // Keep original for download
};

// Allowed image formats for processing
export const allowedImageFormats = ['jpeg', 'jpg', 'png', 'webp'] as const;
export type AllowedImageFormat = typeof allowedImageFormats[number];

// Storage paths
export const storagePaths = {
  uploads: uploadPath,
  temp: tempPath,
  processed: join(uploadPath, 'processed'),
  thumbnails: join(uploadPath, 'thumbnails'),
  medium: join(uploadPath, 'medium'),
  large: join(uploadPath, 'large'),
  original: join(uploadPath, 'original'),
};

// Ensure all storage directories exist
Object.values(storagePaths).forEach(path => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
});