import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { LostPet } from 'src/core/db/entities/LostPet.entity';
import { LostPetDTO } from 'src/core/interfaces/LostPetDTO.interface';
import { coordinatesToPostgis } from 'src/core/utils/coordinates';
import { CacheService } from 'src/cache/cache.service';

const ACTIVE_LOST_PETS_CACHE_KEY = 'lost-pets:active';

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetRepository: Repository<LostPet>,

    private readonly cacheService: CacheService,
  ) {}

  async getActiveLostPets(): Promise<LostPet[]> {
    const cached = await this.cacheService.get<LostPet[]>(
      ACTIVE_LOST_PETS_CACHE_KEY,
    );
    if (cached) return cached;

    const pets = await this.lostPetRepository.find({
      where: { is_active: true },
    });
    await this.cacheService.set(ACTIVE_LOST_PETS_CACHE_KEY, pets);

    return pets;
  }

  async registerLostPet(petData: LostPetDTO): Promise<LostPet> {
    const pet = this.lostPetRepository.create({
      ...petData,
      location: {
        type: 'Point',
        coordinates: coordinatesToPostgis(petData.location),
      },
    });
    await this.lostPetRepository.save(pet);
    await this.cacheService.delete(ACTIVE_LOST_PETS_CACHE_KEY);

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
