import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventBridgeService } from './eventbridge/eventbridge.service';
import { MessagesSyncService } from './sqs/sqs.msgs.sync';

import { Message, MessageSchema } from 'src/messages/models/message.model';

@Module({
  providers: [EventBridgeService, MessagesSyncService],
  exports: [EventBridgeService, MessagesSyncService],
  imports: [MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
})
export class AwsModule {}
