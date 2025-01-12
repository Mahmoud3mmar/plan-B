import { Controller, Post, Body, BadRequestException, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FawryService } from './fawry.service';
import { FawryCallbackDto } from './dto/fawry-callback.dto';
import { CreateChargeRequestDto } from './dto/create-fawry.dto';

@ApiTags('Fawry')
@Controller('fawry')
export class FawryController {
  constructor(private readonly fawryService: FawryService) {}

  // @Post('initiate/payment')
  // @ApiOperation({ summary: 'Initiate payment via Fawry' })
  // @ApiResponse({ status: 201, description: 'Payment initiated successfully.' })
  // @ApiResponse({ status: 400, description: 'Bad Request' })
  // @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // async initiatePayment(@Body() paymentData: FawryPaymentDto): Promise<any> {
  //   return this.fawryService.initiatePayment(paymentData);

  // }

  @Post('initiate/payment')
  async initiatePayment(@Body() createChargeRequestDto: CreateChargeRequestDto): Promise<{ redirectUrl: string }> {
    const redirectUrl = await this.fawryService.createChargeRequest(createChargeRequestDto);
    return { redirectUrl };
  }
  @Post('callback')
  @HttpCode(200)
  async handleCallback(@Body() fawryCallbackDto: FawryCallbackDto): Promise<void> {
    await this.fawryService.handleCallback(fawryCallbackDto);
  }
}
