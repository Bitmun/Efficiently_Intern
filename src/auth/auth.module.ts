import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: {
        expiresIn: 9000,
      },
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}
