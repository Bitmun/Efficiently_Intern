import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthRes } from './dto/auth-res.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtTokenPayload } from './type';

import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async signIn(signInDto: SignInDto): Promise<AuthRes> {
    const { login, password } = signInDto;
    const existingUser = await this.usersService.findByLogin(login);
    if (!existingUser) {
      throw new BadRequestException('User with such login is not found');
    }

    const isMatch = bcrypt.compareSync(password, existingUser.password);

    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }

    const payload: JwtTokenPayload = { login: existingUser.login, id: existingUser.id };

    const accessToken = this.generateAccessToken(payload);

    return { accessToken };
  }

  public async signUp(signUpDto: SignUpDto): Promise<AuthRes> {
    const { login, password } = signUpDto;

    const existingUser = await this.usersService.findByLogin(login);

    if (existingUser) {
      throw new BadRequestException('User with such login already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = await this.usersService.create({
      ...signUpDto,
      password: hashedPassword,
    });

    const payload: JwtTokenPayload = { login: newUser.login, id: newUser.id };

    const accessToken = this.generateAccessToken(payload);

    return { accessToken };
  }

  private generateAccessToken(payload: JwtTokenPayload): string {
    return this.jwtService.sign(payload);
  }

  private hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;

    return bcrypt.hash(password, saltOrRounds);
  }
}
