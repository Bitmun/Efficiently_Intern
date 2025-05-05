import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  async getUser(@Args('id', { type: () => Int }) id: number) {
    return await this.usersService.findById(id);
  }

  @Mutation(() => User)
  async createUser(
    @Args('login', { type: () => String }) login: string,
    @Args('password', { type: () => String }) password: string,
  ) {
    return this.usersService.create({
      login,
      password,
    } as CreateUserDto);
  }

  @Mutation(() => User)
  updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('login', { type: () => String }) login: string,
    @Args('password', { type: () => String }) password: string,
  ) {
    return this.usersService.updateById(id, {
      login,
      password,
    } as UpdateUserDto);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.deleteById(id);
  }
}
