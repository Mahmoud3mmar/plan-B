import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import * as dotenv from 'dotenv';
import { PassThrough } from 'stream';

dotenv.config(); // Load environment variables

@Injectable()
export class CloudinaryService {
  constructor() {
    v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    image: Express.Multer.File,
    folderName: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          folder: `${folderName}`, // Dynamic folder based on branch name
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      toStream(image.buffer).pipe(upload);
    });
  }
  //   async uploadVideo(
//     video: Express.Multer.File,
//     folderName: string
//   ): Promise<UploadApiResponse | UploadApiErrorResponse> {
//     return new Promise((resolve, reject) => {
//       const upload = v2.uploader.upload_stream(
//         {
//           folder: `${folderName}`,
//           chunk_size: 6000000, // Example: 6MB chunk size
//           resource_type: 'video', // Specifies that the resource type is video
//           transformation: [
//             { width: 1280, height: 720, crop: 'limit' }, // Example: Resize to 1280x720
//             { quality: 'auto' } // Auto quality based on network speed
//           ],
//           eager: [
//             { width: 1280, height: 720, crop: 'limit' } // Example: Asynchronous transformation
//           ],
//           eager_async: true // Use asynchronous processing
//         },
//         (error, result) => {
//           if (error) return reject(error);
//           resolve(result);
//         }
//       );
  
//       toStream(video.buffer).pipe(upload);
//     });
//   }

async uploadVideo(
  video: Express.Multer.File,
  folderName: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = v2.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: 'video',
        chunk_size: 6000000, // 6MB chunks
        eager: [
          { width: 1280, height: 720, crop: 'limit' } // Example transformation
        ],
        eager_async: true // Enable asynchronous processing
      },
      (error, result) => {
        if (error) return reject(error); // Handle errors appropriately
        if (!result) return reject(new Error('Unknown error during upload')); // Handle case where result is undefined
        resolve(result); // Return the upload result
      }
    );

    // Use PassThrough if needed for video stream
    const passThrough = new PassThrough();
    passThrough.pipe(uploadStream);
    passThrough.end(video.buffer); // Use video.buffer if video.stream is unavailable
  });
}
async deleteVideo(publicId: string, retries = 3): Promise<void> {
  try {
    // Remove the file extension from the publicId
    const publicIdWithoutExtension = publicId.replace(/\.[^/.]+$/, '');

    // Attempt to delete the video from Cloudinary
    const result = await v2.uploader.destroy(publicIdWithoutExtension, { resource_type: 'video' });

    // Check if the deletion was successful
    if (result.result !== 'ok') {
      throw new Error(`Video with publicId ${publicIdWithoutExtension} not found`);
    }

    console.log(`Video with publicId ${publicIdWithoutExtension} deleted successfully from Cloudinary`);
  } catch (error) {
    // If a timeout or other Cloudinary error occurs, retry the deletion
    if (retries > 0 && error.message.includes('Timeout')) {
      console.warn(`Retrying video deletion for publicId: ${publicId}. Retries left: ${retries - 1}`);
      await this.deleteVideo(publicId, retries - 1); // Recursive retry
    } else {
      console.error('Error deleting video from Cloudinary:', error.message || error);
      throw new Error('Failed to delete video from Cloudinary');
    }
  }
}

// async uploadPdf(pdf: Express.Multer.File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const uploadStream = v2.uploader.upload_stream(
//       {
//         folder: 'curriculumPdfs',
//         resource_type: 'raw', // Specifies that the resource type is raw for non-image/video files
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         if (!result) return reject(new Error('Unknown error during upload'));
//         const inlineUrl = this.generateInlinePdfUrl(result.public_id);
//         resolve(inlineUrl); // Return the inline URL of the uploaded PDF
//       },
//     );

//     const passThrough = new PassThrough();
//     passThrough.end(pdf.buffer);
//     passThrough.pipe(uploadStream);
//   });
// }

// generateInlinePdfUrl(publicId: string): string {
//   // Generate the URL with fl_attachment parameter set to false
//   return v2.url(publicId, {
//     resource_type: 'raw',
//     flags: 'attachment:false',
//     format: 'pdf', // Ensure the format is set to pdf
//   });
// }

async uploadPdf(pdf: Express.Multer.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = v2.uploader.upload_stream(
      {
        resource_type: 'auto', // Cloudinary will automatically detect the file type
        folder: 'pdfs', // Optional: You can specify a folder for PDFs
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Unknown error during upload'));
        resolve(result.secure_url); // Return the secure URL of the uploaded PDF
      },
    );

    toStream(pdf.buffer).pipe(upload);
  });
}
}
