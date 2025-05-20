import { Field, ObjectType } from '@nestjs/graphql';

import { Chat } from 'src/chats/models/chat.model';
import { Message } from 'src/messages/models/message.model';

@ObjectType()
export class GlobalProjectSearchRes {
  @Field(() => [ChatsSearchRes])
  public chatsSearchRes: ChatsSearchRes[];
  @Field(() => [MsgsSearchRes])
  public msgsSearchResult: MsgsSearchRes[];
}
@ObjectType()
export class MsgsSearchRes {
  @Field(() => Chat)
  public chat: Chat;
  @Field(() => [Message])
  public foundChatMessages: Message[];
}

@ObjectType()
export class ChatsSearchRes {
  @Field(() => Chat)
  public chat: Chat;
  @Field(() => Message, { nullable: true })
  public lastMessage: Message | null;
}
