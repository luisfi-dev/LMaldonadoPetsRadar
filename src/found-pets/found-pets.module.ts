import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FoundPetsController } from './found-pets.controller';
import { FoundPetsService } from './found-pets.service';
import { FoundPet } from 'src/core/db/entities/FoundPet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoundPet])],

  controllers: [FoundPetsController],
  providers: [FoundPetsService],
})
export class FoundPetsModule {}
