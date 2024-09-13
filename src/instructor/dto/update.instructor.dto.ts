import { IsOptional, IsString, IsUrl, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SocialMediaLinkDto {
  @IsString()
  readonly type: string;

  @IsUrl()
  readonly url: string;
}

export class UpdateInstructorDto {
  @IsOptional()
  @IsString()
  readonly firstName?: string;

  @IsOptional()
  @IsString()
  readonly lastName?: string;

  @IsOptional()
  @IsString()
  readonly phoneNumber?: string;

  @IsOptional()
  @IsUrl()
  readonly profileImage?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaLinkDto)
  readonly socialMediaLinks?: SocialMediaLinkDto[];

  @IsOptional()
  @IsString()
  readonly bio?: string;
}
