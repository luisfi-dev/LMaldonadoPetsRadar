import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LostPetsController } from './lost-pets.controller';
import { LostPetsService } from './lost-pets.service';
import { LostPet } from 'src/core/db/entities/LostPet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LostPet])],

  controllers: [LostPetsController],
  providers: [LostPetsService],
  exports: [LostPetsService],
})
export class LostPetsModule {}
