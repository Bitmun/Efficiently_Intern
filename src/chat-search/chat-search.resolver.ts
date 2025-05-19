import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { ChatSearchService } from './chat-search.service';

import { AuthGuard } from 'src/guards/auth.guard';
import { AuthContext } from 'src/types/contextTypes';
import { GlobalProjectSearchRes } from 'src/types/searchTypes';

@UseGuards(AuthGuard)
@Resolver()
export class ChatSearchResolver {
  constructor(private readonly chatSearchService: ChatSearchService) {}

  @Query(() => GlobalProjectSearchRes)
  public async globalProjectSearch(
    @Args('query') query: string,
    @Args('projectId') projectId: string,
    @Context() context: AuthContext,
  ): Promise<GlobalProjectSearchRes> {
    const { user } = context.req;
    return await this.chatSearchService.globalProjectSearch(query, projectId, user.id);
  }
}
