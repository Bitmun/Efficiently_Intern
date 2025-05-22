import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventBridgeService } from './eventbridge/eventbridge.service';
import { MessageWorkerService } from './sqs/sqs.msgs.listener';

import { Message, MessageSchema } from 'src/messages/models/message.model';

@Module({
  providers: [EventBridgeService, MessageWorkerService],
  exports: [EventBridgeService, MessageWorkerService],
  imports: [MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
})
export class AwsModule {}
