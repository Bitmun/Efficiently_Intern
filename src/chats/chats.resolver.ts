import { Query, Resolver } from '@nestjs/graphql';

import { Chat } from './models/chat.module';
import { ChatsService } from './chats.service';

@Resolver(() => Chat)
export class ChatsResolver {
  constructor(private chatsService: ChatsService) {}

  @Query(() => [Chat])
  public async findAllChats(): Promise<Chat[]> {
    return await this.chatsService.findAll();
  }
}
