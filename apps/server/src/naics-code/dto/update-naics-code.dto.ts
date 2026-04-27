import { PartialType } from '@nestjs/mapped-types';
import { CreateNaicsCodeDto } from './create-naics-code.dto';

export class UpdateNaicsCodeDto extends PartialType(CreateNaicsCodeDto) {}
