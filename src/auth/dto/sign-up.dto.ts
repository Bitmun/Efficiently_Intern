import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SignUpDto {
  @Field()
  public login: string;

  @Field()
  public password: string;

  @Field()
  public firstName: string;

  @Field()
  public lastName: string;
}
