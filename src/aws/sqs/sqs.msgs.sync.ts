import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Message } from 'src/messages/models/message.model';

@Injectable()
export class MessagesSyncService implements OnModuleInit {
  private readonly sqsClient: SQSClient;

  constructor(
    @InjectModel(Message.name) private readonly msgModel: Model<Message>,
    private configService: ConfigService,
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

      console.log('Received messages:', response.Messages);

      if (!response.Messages) continue;

      for (const msg of response.Messages) {
        // const parsedBody = JSON.parse(msg.Body!) as { detail: Message };

        // const messageBody = parsedBody.detail;

        // await this.msgModel.create({
        //   ...messageBody,
        //   _id: new Types.ObjectId(messageBody._id),
        //   chatId: new Types.ObjectId(messageBody.chatId),
        // });

        await this.sqsClient.send(
          new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: msg.ReceiptHandle!,
          }),
        );
      }
    }
  }
}
