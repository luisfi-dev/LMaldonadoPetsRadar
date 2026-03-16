export interface LostPetDTO {
  name: string;
  species: string;
  breed: string;
  color: string;
  size: string;
  description: string;
  photo_url?: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  location: [number, number];
  address: string;
  lost_date: Date;
}
