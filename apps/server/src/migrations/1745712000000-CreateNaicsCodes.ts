import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNaicsCodes1745712000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE naics_level_enum AS ENUM (
        'SECTOR',
        'SUBSECTOR',
        'INDUSTRY_GROUP',
        'NAICS_INDUSTRY',
        'NATIONAL_INDUSTRY'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE naics_codes (
        id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        code          VARCHAR(6)    NOT NULL,
        version_year  SMALLINT      NOT NULL,
        title         VARCHAR(255)  NOT NULL,
        description   TEXT,
        level         naics_level_enum NOT NULL,
        parent_id     UUID          REFERENCES naics_codes(id) ON DELETE SET NULL,
        is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT uq_naics_code_version UNIQUE (code, version_year)
      )
    `);

    await queryRunner.query(
      `CREATE INDEX idx_naics_parent_id    ON naics_codes (parent_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_naics_level        ON naics_codes (level)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_naics_version_year ON naics_codes (version_year)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_naics_is_active    ON naics_codes (is_active)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS naics_codes`);
    await queryRunner.query(`DROP TYPE IF EXISTS naics_level_enum`);
  }
}
