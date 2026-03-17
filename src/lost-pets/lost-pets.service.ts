import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { LostPet } from 'src/core/db/entities/LostPet.entity';
import { LostPetDTO } from 'src/core/interfaces/LostPetDTO.interface';
import { coordinatesToPostgis } from 'src/core/utils/coordinates';

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
        coordinates: coordinatesToPostgis(petData.location),
      },
    });
    await this.lostPetRepository.save(pet);

    return pet;
  }

  async getNearbyLostPets(lat: number, lon: number): Promise<LostPet[]> {
    const pets = await this.lostPetRepository
      .createQueryBuilder('lost_pets')
      .where(
        `
          ST_DWithin(
            lost_pets.location::geography,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
            500
          )
        `,
        { lon, lat },
      )
      .getMany();

    return pets;
  }
}
