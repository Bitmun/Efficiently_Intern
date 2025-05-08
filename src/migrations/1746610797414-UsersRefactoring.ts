import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersRefactoring1746610797414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE public.users ADD COLUMN uuid UUID DEFAULT uuid_generate_v4();

        UPDATE public.users SET uuid = uuid_generate_v4();

        ALTER TABLE public.users DROP COLUMN id CASCADE;
        
        ALTER TABLE public.users ADD PRIMARY KEY (uuid);

        ALTER TABLE public.users RENAME COLUMN uuid TO id;
`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE public.users ADD COLUMN new_id INTEGER NULL;
        
        UPDATE public.users SET new_id = ('x'||substr(id::text, 1, 8))::bit(32)::int;
        
        ALTER TABLE public.users DROP COLUMN id CASCADE;
        
        ALTER TABLE public.users RENAME COLUMN new_id TO id;
        
        ALTER TABLE public.users ALTER COLUMN id SET NOT NULL;  
`,
    );
  }
}
