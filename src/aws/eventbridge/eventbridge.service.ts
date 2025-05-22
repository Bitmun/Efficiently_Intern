import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventBridgeService {
  private readonly client = new EventBridgeClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  });

  public async publishMessageEvent(message: any): Promise<void> {
    await this.client.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: 'chat-app.messages',
            DetailType: 'NewMessage',
            Detail: JSON.stringify(message),
            EventBusName: 'default',
          },
        ],
      }),
    );
  }
}
