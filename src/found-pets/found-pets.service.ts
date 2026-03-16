import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FoundPet } from 'src/core/db/entities/FoundPet.entity';
import { FoundPetDTO } from 'src/core/interfaces/FoundPetDTO.interface';

@Injectable()
export class FoundPetsService {
  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetRepository: Repository<FoundPet>,
  ) {}

  async registerFoundPet(petData: FoundPetDTO): Promise<FoundPet> {
    const pet = this.foundPetRepository.create({
      ...petData,
      location: {
        type: 'Point',
        coordinates: [petData.location[1], petData.location[0]],
      },
    });
    await this.foundPetRepository.save(pet);

    return pet;
  }
}
