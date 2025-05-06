import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { AuthRes } from './dto/auth-res.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';

import { Response } from 'express';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthRes)
  public async signIn(
    @Args('input', { type: () => SignInDto }) input: SignInDto,
    @Context('res') res: Response,
  ): Promise<AuthRes> {
    const { accessToken } = await this.authService.signIn(input);
    res.cookie('accessToken', accessToken);
    return { accessToken };
  }

  @Mutation(() => AuthRes)
  public async signUp(
    @Args('input', { type: () => SignUpDto }) input: SignUpDto,
    @Context('res') res: Response,
  ): Promise<AuthRes> {
    const { accessToken } = await this.authService.signUp(input);
    res.cookie('accessToken', `Bearer ${accessToken}`);
    return { accessToken };
  }
}
