import { Coordinates } from '../interfaces/Coordinates.interface';

export const coordinatesToPostgis = (coords: Coordinates): [number, number] => [
  coords.lon,
  coords.lat,
];

export const postgisToCoordinates = (
  postgis: [number, number],
): Coordinates => ({
  lat: postgis[1],
  lon: postgis[0],
});
