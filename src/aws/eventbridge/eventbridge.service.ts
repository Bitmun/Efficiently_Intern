import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EventBridgeService {
  private client: EventBridgeClient;

  constructor(private configService: ConfigService) {
    this.client = new EventBridgeClient({
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
  public async publishMessageEvent(message: any): Promise<void> {
    await this.client.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: 'chat-app.messages',
            DetailType: 'NewMessage',
            Detail: JSON.stringify(message),
            EventBusName: 'chat-bus',
          },
        ],
      }),
    );
  }
}
