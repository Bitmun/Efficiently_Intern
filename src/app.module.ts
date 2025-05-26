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
    MongooseModule.forRoot(
      process.env.MONGO_URI ??
        'mongodb://master:pggYHr5quhMudC5w@nestcluster.gahdfkk.mongodb.net/myDatabase?authSource=admin',
      {
        dbName: process.env.MONGO_DB ?? 'myDatabase',
      },
    ),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Project],
      synchronize: true,
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
