import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFoundPetsTable1773692285009 implements MigrationInterface {
  name = 'CreateFoundPetsTable1773692285009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "found_pets" ("id" SERIAL NOT NULL, "species" character varying NOT NULL, "breed" character varying, "color" character varying NOT NULL, "size" character varying NOT NULL, "description" text NOT NULL, "photo_url" character varying, "finder_name" character varying NOT NULL, "finder_email" character varying NOT NULL, "finder_phone" character varying NOT NULL, "location" geometry(Point,4326) NOT NULL, "address" character varying NOT NULL, "found_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(), CONSTRAINT "PK_1e8aeb0b37dd97bfce972552b8d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "found_pets"`);
  }
}
