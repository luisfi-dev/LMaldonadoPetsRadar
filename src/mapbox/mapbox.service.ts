import { Injectable } from '@nestjs/common';

import { env } from 'src/config/env';
import { MapboxOptions } from 'src/core/interfaces/MapboxOptions.interface';

@Injectable()
export class MapboxService {
  generateMapboxUrl(options: MapboxOptions): string {
    const accessToken = env.MAPBOX_TOKEN;

    const zoom = 16.5;
    const width = 800;
    const height = 800;

    // Calcular el punto intermedio entre las dos ubicaciones
    const midLon = (options.lostCoords.lon + options.foundCoords.lon) / 2;
    const midLat = (options.lostCoords.lat + options.foundCoords.lat) / 2;

    // Crear dos puntos con colores distintivos
    // Pin rojo (c92a2a) para la mascota perdida
    // Pin verde (2f9e44) para la mascota encontrada
    const lostPin = `pin-s-p+c92a2a(${options.lostCoords.lon},${options.lostCoords.lat})`;
    const foundPin = `pin-s-e+2f9e44(${options.foundCoords.lon},${options.foundCoords.lat})`;

    return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${lostPin},${foundPin}/${midLon},${midLat},${zoom}/${width}x${height}?access_token=${accessToken}`;
  }
}
