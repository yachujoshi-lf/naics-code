import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateNaicsCodeDto } from './dto/create-naics-code.dto';
import { QueryNaicsCodeDto } from './dto/query-naics-code.dto';
import { UpdateNaicsCodeDto } from './dto/update-naics-code.dto';
import { NaicsCodeService } from './naics-code.service';

@Controller('naics-codes')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class NaicsCodeController {
  constructor(private readonly service: NaicsCodeService) {}

  @Post()
  create(@Body() dto: CreateNaicsCodeDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryNaicsCodeDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/children')
  findChildren(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findChildren(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNaicsCodeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
