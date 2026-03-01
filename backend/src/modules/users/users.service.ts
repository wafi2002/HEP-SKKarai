import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/User.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

   async findUserByName(username: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { username }
        });
    }

    async createUser(userData: Partial<User>): Promise<User> {

        // Check if the user already exists
        const existingUser = await this.usersRepository.findOne({
            where: [
                { username: userData.username },
                { email: userData.email }
            ]
        });

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        // Hash password before saving into db
        if (userData.password) {
            const saltRounds = 10;
            userData.password = await bcrypt.hash(userData.password, saltRounds);
        }

        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }
}
