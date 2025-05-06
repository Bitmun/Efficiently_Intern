import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProjectDto {
  @Field()
  public title: string;

  @Field()
  public body: string;

  @Field(() => Number)
  public creatorId: number;
}
