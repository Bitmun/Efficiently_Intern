import { Field, ObjectType } from '@nestjs/graphql';

import { Project } from 'src/projects/models/project.model';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field((_type) => String)
  public id: string;

  @Column()
  @Field()
  public login: string;

  @Column()
  @Field()
  public password: string;

  @Column()
  @Field()
  public firstName: string;

  @Column()
  @Field()
  public lastName: string;

  @Column({ default: new Date() })
  @Field()
  public createdAt: Date;

  @Column({ default: new Date() })
  @Field()
  public updatedAt: Date;

  @OneToMany(() => Project, (project) => project.creator)
  @Field(() => [Project])
  public createdProjects: Project[];

  @ManyToMany(() => Project, (project) => project.members)
  @Field(() => [Project])
  public projects: Project[];
}
