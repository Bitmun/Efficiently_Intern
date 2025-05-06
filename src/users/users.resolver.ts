import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  public async getUser(
    @Args('input', { type: () => GetUserDto }) input: GetUserDto,
  ): Promise<User | null> {
    const { id } = input;
    return await this.usersService.findById(id);
  }

  @Mutation(() => User)
  public async createUser(
    @Args('input', { type: () => CreateUserDto }) input: CreateUserDto,
  ): Promise<User> {
    return this.usersService.create(input);
  }

  @Mutation(() => User)
  public async updateUser(
    @Args('input', { type: () => UpdateUserDto }) input: UpdateUserDto,
  ): Promise<User | null> {
    const { id, login, password } = input;
    return this.usersService.updateById(id, {
      login,
      password,
    } as UpdateUserDto);
  }

  @Mutation(() => Boolean)
  public async deleteUser(
    @Args('input', { type: () => DeleteUserDto }) input: DeleteUserDto,
  ): Promise<boolean> {
    const { id } = input;
    return this.usersService.deleteById(id);
  }
}
