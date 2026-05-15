import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { LostPet } from 'src/core/db/entities/LostPet.entity';
import { LostPetDTO } from 'src/core/interfaces/LostPetDTO.interface';
import { coordinatesToPostgis } from 'src/core/utils/coordinates';
import { CacheService } from 'src/cache/cache.service';
import { logger } from 'src/config/logger';

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

    logger.info('LostPets: iniciando lectura de mascotas perdidas activas');
    const pets = await this.lostPetRepository.find({
      where: { is_active: true },
    });
    logger.info(
      `LostPets: lectura exitosa de mascotas perdidas activas (${pets.length} registro(s))`,
    );

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

    logger.info('LostPets: iniciando escritura de mascota perdida');
    await this.lostPetRepository.save(pet);
    logger.info(
      `LostPets: escritura exitosa de mascota perdida (id=${pet.id})`,
    );

    await this.cacheService.delete(ACTIVE_LOST_PETS_CACHE_KEY);

    return pet;
  }

  async getNearbyLostPets(lat: number, lon: number): Promise<LostPet[]> {
    logger.info(
      `LostPets: iniciando lectura de mascotas perdidas cercanas (lat=${lat}, lon=${lon})`,
    );
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
    logger.info(
      `LostPets: lectura exitosa de mascotas perdidas cercanas (${pets.length} registro(s))`,
    );

    return pets;
  }
}
