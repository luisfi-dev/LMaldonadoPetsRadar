import { Body, Controller, Post } from '@nestjs/common';

import { FoundPetsService } from './found-pets.service';
import type { FoundPetDTO } from 'src/core/interfaces/FoundPetDTO.interface';
import { FoundPet } from 'src/core/db/entities/FoundPet.entity';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly service: FoundPetsService) {}

  @Post()
  async registerFoundPet(@Body() petData: FoundPetDTO): Promise<FoundPet> {
    const pet = this.service.registerFoundPet(petData);
    return pet;
  }
}
