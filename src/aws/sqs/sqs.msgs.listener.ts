import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import { Message } from 'src/messages/models/message.model';

@Injectable()
export class MessageWorkerService implements OnModuleInit {
  private readonly sqsClient = new SQSClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  });
  private readonly queueUrl = 'http://localhost:4566/000000000000/chat-message-queue';

  constructor(@InjectModel(Message.name) private readonly msgModel: Model<Message>) {}

  public onModuleInit(): void {
    void this.poll();
  }

  private async poll(): Promise<void> {
    while (true) {
      const response = await this.sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
        }),
      );

      if (!response.Messages) continue;

      for (const msg of response.Messages) {
        const parsedBody = JSON.parse(msg.Body!) as { detail: Message };

        const messageBody = parsedBody.detail;

        await this.msgModel.create({
          ...messageBody,
          _id: new Types.ObjectId(messageBody._id),
          chatId: new Types.ObjectId(messageBody.chatId),
        });

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
