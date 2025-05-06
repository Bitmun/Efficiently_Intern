import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuthRes } from './dto/auth-res.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => Boolean)
  public async signIn(
    @Args('input', { type: () => SignInDto }) input: SignInDto,
  ): Promise<AuthRes> {
    const { accessToken } = await this.authService.signIn(input);
    return { accessToken };
  }

  @Mutation(() => Boolean)
  public async signUp(
    @Args('input', { type: () => SignUpDto }) input: SignUpDto,
  ): Promise<AuthRes> {
    const { accessToken } = await this.authService.signUp(input);
    return { accessToken };
  }
}
