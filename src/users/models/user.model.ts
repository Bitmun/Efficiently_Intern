import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field((_type) => Int)
  id: number;

  @Column()
  @Field()
  login: string;

  @Column()
  @Field()
  password: string;

  @Column({ default: new Date() })
  @Field()
  createdAt: Date;

  @Column({ default: new Date() })
  @Field()
  updatedAt: Date;
}
