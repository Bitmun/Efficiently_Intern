import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import { Message } from 'src/messages/models/message.model';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class MessagesSyncService implements OnModuleInit {
  private readonly sqsClient: SQSClient;

  constructor(
    @InjectModel(Message.name) private readonly msgModel: Model<Message>,
    private configService: ConfigService,
    private readisService: RedisService,
  ) {
    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('AWS_REGION') ?? 'us-east-1',
      endpoint:
        this.configService.get<string>('AWS_ENDPOINT') ?? 'http://localstack:4566',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? 'test',
        secretAccessKey:
          this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? 'test',
      },
    });
  }
  private readonly queueUrl = 'http://localstack:4566/000000000000/message-sync-queue';

  public onModuleInit(): void {
    void this.poll();
  }

  private async poll(): Promise<void> {
    while (true) {
      const response = await this.sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 5,
        }),
      );

      if (!response.Messages) continue;

      const lastSync = await this.readisService.getLastMsgsSync();

      const activeMessages = await this.readisService.findAllActiveChats();

      const msgsToSync = activeMessages
        .filter((msg) => new Date(msg.createdAt) > lastSync)
        .map((filtered) => ({
          ...filtered,
          chatId: new Types.ObjectId(filtered.chatId),
        }));

      if (msgsToSync.length !== 0) {
        await this.msgModel.insertMany(msgsToSync);
      }

      for (const msg of response.Messages) {
        await this.sqsClient.send(
          new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: msg.ReceiptHandle!,
          }),
        );
      }

      await this.readisService.setLastSyncDate(new Date());
    }
  }
}
