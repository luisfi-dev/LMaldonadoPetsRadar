import { Coordinates } from './Coordinates.interface';

export interface FoundPetDTO {
  species: string;
  breed?: string;
  color: string;
  size: string;
  description: string;
  photo_url?: string;
  finder_name: string;
  finder_email: string;
  finder_phone: string;
  location: Coordinates;
  address: string;
  found_date: Date;
}
