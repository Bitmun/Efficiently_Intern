import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteMessageDto {
  @Field()
  public messageId: string;
}
