import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SendMessageDto {
  @Field()
  public chatId: string;

  @Field()
  public body: string;
}
