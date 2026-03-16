import {
  Column,
  CreateDateColumn,
  Entity,
  type Point,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('found_pets')
export class FoundPet {
  @PrimaryGeneratedColumn() id: number;
  @Column() species: string;
  @Column({ nullable: true }) breed?: string;
  @Column() color: string;
  @Column() size: string;
  @Column({ type: 'text' }) description: string;
  @Column({ nullable: true }) photo_url?: string;
  @Column() finder_name: string;
  @Column() finder_email: string;
  @Column() finder_phone: string;
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;
  @Column() address: string;
  @Column({ type: 'timestamp' }) found_date: Date;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NOW()',
  })
  created_at: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'NOW()',
  })
  updated_at: Date;
}
