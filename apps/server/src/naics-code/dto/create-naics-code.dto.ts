import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { NaicsLevel } from '../naics-code.entity';

export class CreateNaicsCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 6)
  code: string;

  @IsInt()
  @Min(1997)
  @Max(2099)
  versionYear: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(NaicsLevel)
  level: NaicsLevel;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
