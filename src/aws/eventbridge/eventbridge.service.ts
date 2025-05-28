import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EventBridgeService implements OnModuleInit {
  private client: EventBridgeClient;

  constructor(private configService: ConfigService) {
    this.client = new EventBridgeClient({
      region: this.configService.get<string>('AWS_REGION') ?? 'us-east-1',
      endpoint: this.configService.get<string>('AWS_ENDPOINT') ?? 'http://localhost:4566',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? 'test',
        secretAccessKey:
          this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? 'test',
      },
    });
  }

  public onModuleInit(): void {
    void this.scheduleSyncEvent();
  }

  public scheduleSyncEvent(): void {
    setInterval(() => {
      this.client
        .send(
          new PutEventsCommand({
            Entries: [
              {
                Source: 'chat-app.sync',
                DetailType: 'SyncMessages',
                Detail: JSON.stringify({ action: 'sync' }),
                EventBusName: 'chat-bus',
              },
            ],
          }),
        )
        .catch((error) => {
          console.error('Error scheduling sync event:', error);
        });
    }, 5000);
  }
}
