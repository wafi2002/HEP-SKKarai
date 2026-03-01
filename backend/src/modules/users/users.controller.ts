import { Controller, Get, Post, Delete, UseGuards, Param, Req, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorator/roles/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  // Sesiapa yang login boleh access
  @Get('profile')
  getProfile(@Req() request: any) {
    const user = request.user;
    return { message: 'Your profile', user };
  }

  // Hanya ADMIN boleh access
  @Get()
  @UseGuards(RolesGuard)
  @Roles('Admin')
  getAllUsers() {
    return { message: 'List of all users (admin only)' };
  }

  // Only super Admin can create the user
  @Post()
  @UseGuards(RolesGuard)
  @Roles('Super Admin')
  async createUser(@Body() createUserDto: CreateUserDto) {

    await this.usersService.createUser(createUserDto);
    return {
            message: 'User created successfully',
        };
  }

  // Hanya ADMIN boleh delete
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  deleteUser(@Param('id') id: string) {
    return { message: `Delete user ${id} (admin only)` };
  }
}
