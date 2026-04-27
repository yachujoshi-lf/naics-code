import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NaicsCodeController } from './naics-code.controller';
import { NaicsCode } from './naics-code.entity';
import { NaicsCodeService } from './naics-code.service';

@Module({
  imports: [TypeOrmModule.forFeature([NaicsCode])],
  controllers: [NaicsCodeController],
  providers: [NaicsCodeService],
  exports: [NaicsCodeService],
})
export class NaicsCodeModule {}
