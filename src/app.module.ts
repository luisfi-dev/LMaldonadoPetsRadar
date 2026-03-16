import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './core/db/dataSource';
import { LostPetsModule } from './lost-pets/lost-pets.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), LostPetsModule],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
