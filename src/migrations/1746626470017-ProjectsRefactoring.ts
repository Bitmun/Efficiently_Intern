import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectsRefactoring1746626470017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE public.projects ADD COLUMN uuid UUID DEFAULT uuid_generate_v4();

        UPDATE public.projects SET uuid = uuid_generate_v4();

        ALTER TABLE public.projects DROP CONSTRAINT PK_a3ffb1c0c8416b9fc6f907b7433;

        ALTER TABLE public.projects ADD PRIMARY KEY (uuid);

        ALTER TABLE public.projects DROP COLUMN id;

        ALTER TABLE public.projects RENAME COLUMN uuid TO id;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE public.projects ADD COLUMN new_id INTEGER NULL;
        
        UPDATE public.projects SET new_id = ('x'||substr(id::text, 1, 8))::bit(32)::int;
        
        ALTER TABLE public.projects DROP COLUMN id;
        
        ALTER TABLE public.projects RENAME COLUMN new_id TO id;
        
        ALTER TABLE public.projects ALTER COLUMN id SET NOT NULL;        
        `,
    );
  }
}
