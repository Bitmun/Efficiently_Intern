import { Field, ObjectType } from '@nestjs/graphql';

import { User } from 'src/users/models/user.model';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('projects')
@ObjectType()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  public id: string;

  @Column()
  @Field()
  public title: string;

  @Column('text')
  @Field()
  public body: string;

  @Column('uuid')
  @Field()
  public creator_id: string;

  @ManyToOne(() => User, (user) => user.createdProjects)
  @Field(() => User)
  @JoinColumn({ name: 'creator_id' })
  public creator: User;

  @ManyToMany(() => User, (user) => user.projects)
  @JoinTable()
  @Field(() => [User], { nullable: true })
  public members: User[];
}
