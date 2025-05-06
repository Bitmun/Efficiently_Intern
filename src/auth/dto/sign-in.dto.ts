import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SignInDto {
  @Field()
  public login: string;
  @Field()
  public password: string;
}
