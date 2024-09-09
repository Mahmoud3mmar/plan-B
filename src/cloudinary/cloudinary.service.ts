import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import * as dotenv from 'dotenv';

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
          folder: `${folderName}`,  // Dynamic folder based on branch name
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
  
      toStream(image.buffer).pipe(upload);
    });
  }
}
