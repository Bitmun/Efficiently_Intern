import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './models/user.model';

import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  public async updateById(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    await this.usersRepository.update({ id }, updateUserDto);
    return this.findById(id);
  }

  public async deleteById(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) {
      return false;
    }
    await this.usersRepository.delete({ id });
    return true;
  }

  public findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  public findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }

  public findByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        login,
      },
    });
  }
}
