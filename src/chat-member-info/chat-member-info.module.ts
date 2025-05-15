import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatMemberInfo, ChatMemberInfoSchema } from './model/chat-member-info.model';
import { ChatMemberInfoService } from './chat-member-info.service';

@Module({
  providers: [ChatMemberInfoService],
  imports: [
    MongooseModule.forFeature([
      { name: ChatMemberInfo.name, schema: ChatMemberInfoSchema },
    ]),
  ],
  exports: [ChatMemberInfoService],
})
export class ChatMemberInfoModule {}
