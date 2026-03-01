import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request  } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly AttendanceService: AttendanceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createAttendanceDto: CreateAttendanceDto, @Request() req) {
    const teacherId = req.user.teacherId;
    console.log(teacherId);
    return this.AttendanceService.create(createAttendanceDto, teacherId);
  }

  @Get()
  findAll() {
    return this.AttendanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.AttendanceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateKehadiranMuridDto: UpdateAttendanceDto) {
    return this.AttendanceService.update(+id, UpdateKehadiranMuridDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.AttendanceService.remove(+id);
  }

  @Get('fetch-absents/:class_ID')
  findByClass(@Param('class_ID') class_ID: string){
    return this.AttendanceService.findByClass(class_ID);
  }

  @Get('check-session/:class_ID/:date')
  checkSession(@Param('class_ID') class_ID: string, @Param('date') date: string) {
    return this.AttendanceService.checkSession(class_ID, date);
  }
  }
