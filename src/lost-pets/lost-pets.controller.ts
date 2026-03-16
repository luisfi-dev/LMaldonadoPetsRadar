import { Body, Controller, Post } from '@nestjs/common';

import { LostPetsService } from './lost-pets.service';
import type { LostPetDTO } from 'src/core/interfaces/LostPetDTO.interface';
import { LostPet } from 'src/core/db/entities/LostPet.entity';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly service: LostPetsService) {}

  @Post()
  async registerLostPet(@Body() petData: LostPetDTO): Promise<LostPet> {
    const pet = await this.service.registerLostPet(petData);
    return pet;
  }
}
