/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { AwsModule } from './aws/aws.module';
import { ChatMembersModule } from './chat-members/chat-members.module';
import { ChatSearchModule } from './chat-search/chat-search.module';
import { ChatsModule } from './chats/chats.module';
import { MONGO_CONFIG } from './config/mongo';
import { OnConnectGuard } from './guards/ws-auth.guard';
import { MessagesModule } from './messages/messages.module';
import { Project } from './projects/models/project.model';
import { ProjectsModule } from './projects/projects.module';
import { RedisModule } from './redis/redis.module';
import { User } from './users/models/user.model';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      autoSchemaFile: true,
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      },
      subscriptions: {
        'graphql-ws': {
          onConnect: OnConnectGuard,
        },
      },
      context: ({ req, res, extra }) => {
        if (extra) {
          return {
            req: {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              user: extra.user,
            },
          };
        }

        return { req, res };
      },
    }),
    MongooseModule.forRoot(MONGO_CONFIG.uri, {
      dbName: MONGO_CONFIG.options.dbName,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [User, Project],
      synchronize: false,
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    ProjectsModule,
    ChatsModule,
    MessagesModule,
    ChatMembersModule,
    ChatSearchModule,
    RedisModule,
    AwsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
