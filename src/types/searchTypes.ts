import { Field, ObjectType } from '@nestjs/graphql';

import { Chat } from 'src/chats/models/chat.model';
import { Message } from 'src/messages/models/message.model';

@ObjectType()
export class GlobalProjectSearchRes {
  @Field(() => [Chat])
  public chats: Chat[];
  @Field(() => [Message])
  public messages: Message[];
}
