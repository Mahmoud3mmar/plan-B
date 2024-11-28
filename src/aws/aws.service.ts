import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';

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
} 