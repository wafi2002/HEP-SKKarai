import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { TeacherService } from '../teacher/teacher.service';

type AuthInput = {username: string, password: string}
type SignInData = {id: string, teacherId?: string, name:string, username: string, role:string}
type AuthResult = {accessToken: string, id: string, username: string, role: string}

type TokenPayload = {
    sub: string;
    name: string;
    username: string;
    role: string;
    teacherId?: string;  // Optional
    studentId?: string;  // Optional (kalau nak tambah student kemudian)
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly teacherService: TeacherService,
        private jwtService: JwtService
    ) {}

    async authenticate(input: AuthInput): Promise<AuthResult> {
        const user = await this.validateUser(input);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.signIn(user);
    }


    async validateUser(input: AuthInput): Promise<SignInData | null> {
        // Find user based on username
       const user = await this.usersService.findUserByName(input.username);
       if (!user) {
           throw new UnauthorizedException('Invalid credentials');
       }

       // compare client password with hashed password
       const isPasswordMatched = await bcrypt.compare(input.password, user.password);
    
        if (!isPasswordMatched) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const signInData: SignInData = {
            id: user.id, 
            name: user.name, 
            username: user.username, 
            role: user.role
        };

        if(user.role === 'Teacher'){
            const teacher = await this.teacherService.findTeacherByUserId(user.id);
            if (teacher) {
                signInData.teacherId = teacher.id;
            }
        }

       return signInData;
    }

    async signIn(user: SignInData): Promise<AuthResult>{
        const tokenPayload: TokenPayload ={
            sub: user.id,
            name: user.name,
            username: user.username,
            role: user.role
        };

        if (user.teacherId) {
            tokenPayload.teacherId = user.teacherId;
        }

        const accessToken = this.jwtService.sign(tokenPayload);

        return {
            accessToken,
            id: user.id,
            username: user.username,
            role: user.role
        }
    }
}
