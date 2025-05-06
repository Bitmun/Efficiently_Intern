import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthRes {
  @Field()
  public accessToken: string;
}
