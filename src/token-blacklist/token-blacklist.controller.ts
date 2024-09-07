import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TokenBlacklistService } from './token-blacklist.service';
import { CreateTokenBlacklistDto } from './dto/create-token-blacklist.dto';
import { UpdateTokenBlacklistDto } from './dto/update-token-blacklist.dto';

@Controller('token-blacklist')
export class TokenBlacklistController {
  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {}

  // @Post()
  // create(@Body() createTokenBlacklistDto: CreateTokenBlacklistDto) {
  //   return this.tokenBlacklistService.create(createTokenBlacklistDto);
  // }

  // @Get()
  // findAll() {
  //   return this.tokenBlacklistService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.tokenBlacklistService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTokenBlacklistDto: UpdateTokenBlacklistDto) {
  //   return this.tokenBlacklistService.update(+id, updateTokenBlacklistDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.tokenBlacklistService.remove(+id);
  // }
}
