import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field((_type) => Int)
  public id: number;

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
}
