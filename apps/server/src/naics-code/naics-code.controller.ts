import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { QueryNaicsCodeDto } from './dto/query-naics-code.dto';
import { NaicsCodeService } from './naics-code.service';

@Controller('naics-codes')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class NaicsCodeController {
  constructor(private readonly service: NaicsCodeService) {}

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
}
