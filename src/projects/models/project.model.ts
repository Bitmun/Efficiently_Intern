import { Field, ID, ObjectType } from '@nestjs/graphql';

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

@Entity()
@ObjectType()
export class Project {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  public id: number;

  @Column()
  @Field()
  public title: string;

  @Column('text')
  @Field()
  public body: string;

  @Column('integer')
  @Field()
  public creatorId: number;

  @ManyToOne(() => User, (user) => user.createdProjects)
  @Field(() => User)
  @JoinColumn({ name: 'creatorId' })
  public creator: User;

  @ManyToMany(() => User, (user) => user.projects)
  @JoinTable()
  @Field(() => [User], { nullable: true })
  public members: User[];
}
