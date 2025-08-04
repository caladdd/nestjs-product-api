import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1754333717209 implements MigrationInterface {
  name = 'CreateUserTable1754333717209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "isDeleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "createdAt" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "updatedAt" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "updatedAt" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "createdAt" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "isDeleted"`);
  }
}
