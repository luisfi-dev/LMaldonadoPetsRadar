import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FoundPetsController } from './found-pets.controller';
import { FoundPetsService } from './found-pets.service';
import { FoundPet } from 'src/core/db/entities/FoundPet.entity';
import { EmailModule } from 'src/email/email.module';
import { MapboxModule } from 'src/mapbox/mapbox.module';
import { LostPetsModule } from 'src/lost-pets/lost-pets.module';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoundPet]),
    EmailModule,
    MapboxModule,
    LostPetsModule,
    CacheModule,
  ],

  controllers: [FoundPetsController],
  providers: [FoundPetsService],
})
export class FoundPetsModule {}
