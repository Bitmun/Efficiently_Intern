import { Field, Int, ObjectType } from '@nestjs/graphql';

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
  @Field(() => Int)
  public id: number;

  @Column()
  @Field()
  public title: string;

  @Column('text')
  @Field()
  public body: string;

  @Column('uuid')
  @Field()
  public creatorId: string;

  @ManyToOne(() => User, (user) => user.createdProjects)
  @Field(() => User)
  @JoinColumn({ name: 'creatorId' })
  public creator: User;

  @ManyToMany(() => User, (user) => user.projects)
  @JoinTable()
  @Field(() => [User], { nullable: true })
  public members: User[];
}
