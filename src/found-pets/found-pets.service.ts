import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FoundPet } from 'src/core/db/entities/FoundPet.entity';
import { FoundPetDTO } from 'src/core/interfaces/FoundPetDTO.interface';
import { EmailService } from 'src/email/email.service';
import {
  coordinatesToPostgis,
  postgisToCoordinates,
} from 'src/core/utils/coordinates';
import { Coordinates } from 'src/core/interfaces/Coordinates.interface';
import { MapboxService } from 'src/mapbox/mapbox.service';
import { LostPetsService } from 'src/lost-pets/lost-pets.service';
import { LostPet } from 'src/core/db/entities/LostPet.entity';
import { CacheService } from 'src/cache/cache.service';

const FOUND_PETS_CACHE_KEY = 'found-pets:all';

@Injectable()
export class FoundPetsService {
  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetRepository: Repository<FoundPet>,

    private readonly emailService: EmailService,
    private readonly mapboxService: MapboxService,
    private readonly lostPetsService: LostPetsService,
    private readonly cacheService: CacheService,
  ) {}

  async getFoundPets(): Promise<FoundPet[]> {
    const cached =
      await this.cacheService.get<FoundPet[]>(FOUND_PETS_CACHE_KEY);
    if (cached) return cached;

    const pets = await this.foundPetRepository.find();
    await this.cacheService.set(FOUND_PETS_CACHE_KEY, pets);

    return pets;
  }

  async registerFoundPet(petData: FoundPetDTO): Promise<FoundPet> {
    const foundPet = this.foundPetRepository.create({
      ...petData,
      location: {
        type: 'Point',
        coordinates: coordinatesToPostgis(petData.location),
      },
    });
    await this.foundPetRepository.save(foundPet);
    await this.cacheService.delete(FOUND_PETS_CACHE_KEY);

    const nearbyLostPets = await this.lostPetsService.getNearbyLostPets(
      petData.location.lat,
      petData.location.lon,
    );
    await Promise.all(
      nearbyLostPets.map((lostPet) =>
        this.handleFoundPetEmail(foundPet, lostPet),
      ),
    );

    return foundPet;
  }

  async handleFoundPetEmail(foundPet: FoundPet, lostPet: LostPet) {
    const lostPetCoords = postgisToCoordinates(
      lostPet.location.coordinates as [number, number],
    );
    const emailTemplate = this.generateEmailTemplate(foundPet, lostPetCoords);

    await this.emailService.sendEmail({
      to: lostPet.owner_email,
      subject: `Mascota encontrada: ${foundPet.species}, ${foundPet.color}, ${foundPet.breed ?? 'Raza desconocida'}`,
      html: emailTemplate,
    });
  }

  generateEmailTemplate(
    foundPet: FoundPet,
    lostPetCoords: Coordinates,
  ): string {
    const foundPetCoords = postgisToCoordinates(
      foundPet.location.coordinates as [number, number],
    );

    const mapboxUrl = this.mapboxService.generateMapboxUrl({
      lostCoords: lostPetCoords,
      foundCoords: foundPetCoords,
    });

    const date = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5;padding:32px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1ABC9C,#1ABC9Ccc);padding:32px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-top:16px;">
                          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;line-height:1.3;">
                            Mascota encontrada
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:8px;">
                          <span style="display:inline-block;background-color:#ffffff;color:#1ABC9C;font-size:13px;font-weight:700;padding:6px 16px;border-radius:20px;">
                            ${foundPet.species}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Details -->
                <tr>
                  <td style="padding:32px 40px 0;">
                    <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">
                      Detalles de la mascota
                    </h2>
                    <p style="margin:0;font-size:16px;color:#1f2937;line-height:1.6;">
                      <strong>Raza:</strong> ${foundPet.breed ?? 'Sin especificar'}
                    </p>
                    <p style="margin:0;font-size:16px;color:#1f2937;line-height:1.6;">
                      <strong>Color:</strong> ${foundPet.color}
                    </p>
                    <p style="margin:0;font-size:16px;color:#1f2937;line-height:1.6;">
                      <strong>Tamaño:</strong> ${foundPet.size}
                    </p>
                    <p style="margin:0;font-size:16px;color:#1f2937;line-height:1.6;">
                      <strong>Descripción:</strong> ${foundPet.description}
                    </p>
                  </td>
                </tr>

                <!-- Location Info -->
                <tr>
                  <td style="padding:24px 40px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fb;border-radius:12px;overflow:hidden;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <h2 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">
                            Ubicación
                          </h2>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%" style="padding-bottom:8px;">
                                <span style="font-size:12px;color:#9ca3af;font-weight:500;">Latitud</span><br/>
                                <span style="font-size:15px;color:#1f2937;font-weight:600;">${foundPetCoords.lat}</span>
                              </td>
                              <td width="50%" style="padding-bottom:8px;">
                                <span style="font-size:12px;color:#9ca3af;font-weight:500;">Longitud</span><br/>
                                <span style="font-size:15px;color:#1f2937;font-weight:600;">${foundPetCoords.lon}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fb;border-radius:12px;overflow:hidden;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <h2 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">
                            Ud. reportó una mascota perdida aquí
                          </h2>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%" style="padding-bottom:8px;">
                                <span style="font-size:12px;color:#9ca3af;font-weight:500;">Latitud</span><br/>
                                <span style="font-size:15px;color:#1f2937;font-weight:600;">${lostPetCoords.lat}</span>
                              </td>
                              <td width="50%" style="padding-bottom:8px;">
                                <span style="font-size:12px;color:#9ca3af;font-weight:500;">Longitud</span><br/>
                                <span style="font-size:15px;color:#1f2937;font-weight:600;">${lostPetCoords.lon}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Map Image -->
                <tr>
                  <td style="padding:24px 40px;">
                    <img src="${mapboxUrl}" width="520" style="width:100%;border-radius:12px;display:block;" alt="Mapa de ubicación"/>
                  </td>
                </tr>

                <!-- Contact details -->
                <tr>
                  <td style="padding:32px 40px 0;">
                    <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">
                      Contacto de quien le encontró
                    </h2>
                    <p style="margin:0;font-size:16px;color:#1f2937;line-height:1.6;">
                      <strong>Nombre:</strong> ${foundPet.finder_name}
                    </p>
                    <p style="margin:0;font-size:16px;color:#1f2937;line-height:1.6;">
                      <strong>Correo:</strong> ${foundPet.finder_email}
                    </p>
                    <p style="margin:0;font-size:16px;color:#1f2937;line-height:1.6;">
                      <strong>Teléfono:</strong> ${foundPet.finder_phone}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:0 40px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;padding-top:20px;">
                      <tr>
                        <td>
                          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                            Reporte generado el ${date}
                          </p>
                          <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">
                            <strong>PetRadar</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
