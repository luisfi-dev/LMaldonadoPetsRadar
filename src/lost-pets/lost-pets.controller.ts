import { Body, Controller, Get, Post } from '@nestjs/common';

import { LostPetsService } from './lost-pets.service';
import type { LostPetDTO } from 'src/core/interfaces/LostPetDTO.interface';
import { LostPet } from 'src/core/db/entities/LostPet.entity';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly service: LostPetsService) {}

  @Get()
  async getActiveLostPets(): Promise<LostPet[]> {
    return this.service.getActiveLostPets();
  }

  @Post()
  async registerLostPet(@Body() petData: LostPetDTO): Promise<LostPet> {
    const pet = await this.service.registerLostPet(petData);
    return pet;
  }
}
