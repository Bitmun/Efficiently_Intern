import { MigrationInterface, QueryRunner } from 'typeorm';

// ALTER TABLE public.projects ADD COLUMN new_id UUID NULL;
// UPDATE foo SET new_id = CAST(LPAD(TO_HEX(id), 32, '0') AS UUID);
// ALTER TABLE public.projects DROP COLUMN id;
// ALTER TABLE public.projects RENAME COLUMN new_id TO id;
// ALTER TABLE public.projects ALTER COLUMN id SET NOT NULL;

export class UsersRefactoring1746610797414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE public.users ADD COLUMN uuid UUID DEFAULT uuid_generate_v4();

        UPDATE public.users SET uuid = uuid_generate_v4();

        ALTER TABLE public.users DROP CONSTRAINT PK_a3ffb1c0c8416b9fc6f907b7433;

        ALTER TABLE public.users ADD PRIMARY KEY (uuid);

        ALTER TABLE public.users DROP COLUMN id;

        ALTER TABLE public.users RENAME COLUMN uuid TO id;
`,
    );
  }

  //   ALTER TABLE public.projects ADD COLUMN new_id INTEGER NULL;
  //   UPDATE public.projects SET new_id = ('x'||substr(id::text, 1, 8))::bit(32)::int;
  //   ALTER TABLE public.projects DROP COLUMN id;
  //   ALTER TABLE public.projects RENAME COLUMN new_id TO id;
  //   ALTER TABLE public.projects ALTER COLUMN id SET NOT NULL;

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
