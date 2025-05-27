import { Field, InputType } from '@nestjs/graphql';

import { User } from '../models/user.model';

@InputType()
export class UpdateUserDto implements Partial<User> {
  @Field({ nullable: true })
  public login?: string;

  @Field({ nullable: true })
  public password?: string;

  @Field({ nullable: true })
  public firstName?: string;

  @Field({ nullable: true })
  public lastName?: string;
}
