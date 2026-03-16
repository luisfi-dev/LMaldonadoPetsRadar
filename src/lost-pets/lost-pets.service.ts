import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { LostPet } from 'src/core/db/entities/LostPet.entity';
import { LostPetDTO } from 'src/core/interfaces/LostPetDTO.interface';

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetRepository: Repository<LostPet>,
  ) {}

  async registerLostPet(petData: LostPetDTO): Promise<LostPet> {
    const pet = this.lostPetRepository.create({
      ...petData,
      location: {
        type: 'Point',
        coordinates: [petData.location[1], petData.location[0]],
      },
    });
    await this.lostPetRepository.save(pet);

    return pet;
  }
}
