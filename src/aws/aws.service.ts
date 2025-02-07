import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

@Injectable()
export class AwsService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
    folderName: string
  ): Promise<{ fileUrl: string; key: string }> {
    try {
      const fileName = `${folderName}/${Date.now()}-${file.originalname}`;
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const uploadResult = await this.s3.upload(params).promise();

      const encodedFileName = encodeURIComponent(fileName);
      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedFileName}`;

      return {
        fileUrl,
        key: uploadResult.Key,
      };
    } catch (error) {
      console.error('Error uploading video to S3:', error);
      throw new InternalServerErrorException('Failed to upload video to S3');
    }
  }
  private s3duplicate = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  // async generatePresignedUrl(
  //   file: Express.Multer.File,
  //  ) {
  //     const fileName = `uploads/${Date.now()}-${file.originalname}`;

  //   const params = {
  //     Bucket: process.env.AWS_S3_BUCKET_NAME,
      
  //     Key:fileName, // Unique file path
  //     ContentType: file.mimetype,
  //   };

  //   const command = new PutObjectCommand(params);
  //   return await getSignedUrl(this.s3duplicate, command, { expiresIn: 300 });
  // }

  // async generatePresignedUrl(fileOriginalName: string) {
  //   const fileName = `courses/${Date.now()}-${fileOriginalName}`;

  //   const { url, fields } = await createPresignedPost(this.s3duplicate, {
  //     Bucket: process.env.AWS_S3_BUCKET_NAME,
  //     Key: fileName,
  //     Expires: 60, // URL expires in 60 seconds
  //     Conditions: [
  //       // ['content-length-range', 0, 50 * 1024 * 1024], // Max file size: 50MB
  //       ['starts-with', '$Content-Type', 'video/'], // Only video files allowed
  //     ],
  //     Fields: {
  //       'Content-Type': fileName,
  //     },
  //   });

  //   return { url, fields, fileName };
  // }

  // async generatePresignedUrl(fileOriginalName: string, fileType: string) {
  //   const timestamp = Date.now();
  //   // const fileExtension = fileOriginalName.split('.').pop(); // Get file extension
  //   const fileName = `courses/${Date.now()}-${fileOriginalName}`;
  
  //   const { url, fields } = await createPresignedPost(this.s3duplicate, {
  //     Bucket: process.env.AWS_S3_BUCKET_NAME,
  //     Key: fileName,
  //     Expires: 60, // URL expires in 60 seconds
  //     Conditions: [
  //       ['starts-with', '$Content-Type', fileType], // Ensure correct Content-Type
  //     ],
  //     Fields: {
  //       'Content-Type': fileType, // Set correct Content-Type
  //     },
  //   });
  
  //   return { url, fields, fileName };
  // }
  async generatePresignedUrl(
    key: string,
    fileType: string,
  ): Promise<any> {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not defined in the environment variables.');
    }

    console.log('Bucket Name:', bucketName);

    const { url, fields } = await createPresignedPost(this.s3duplicate, {
      Bucket: bucketName,
      Key: key,
      Expires: 3600, // URL expires in 1 hour
      Conditions: [
        ['starts-with', '$Content-Type', fileType], // Ensure correct Content-Type
      ],
      Fields: {
        'Content-Type': fileType, // Set correct Content-Type
      },
    });

    return { url, fields , fileName:key }; // Return the correct structure
  }
} 