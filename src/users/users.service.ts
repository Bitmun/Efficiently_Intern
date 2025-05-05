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

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async updateById(id: number, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update({ id }, updateUserDto);
    return this.findById(id);
  }

  async deleteById(id: number) {
    const user = await this.findById(id);
    if (!user) {
      return false;
    }
    return await this.usersRepository.delete({ id });
  }

  findAll() {
    return this.usersRepository.find();
  }

  findById(id: number) {
    return this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }
}
