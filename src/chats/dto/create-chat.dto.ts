import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateChatDto {
  @Field()
  public projectId: string;

  @Field()
  public subject: string;

  @Field(() => [String], { nullable: true })
  public memberIds?: string[];
}
