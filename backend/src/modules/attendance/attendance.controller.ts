import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpStatus, HttpCode, UseInterceptors  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  /**
   * Export attendace data to excel
   * POST /attendace/export
   * Content-Type: multipart/form-data
   * Body: file (data)
   */
  @Post('export')
  @HttpCode(HttpStatus.OK)
  async exportExcel(@Body() body: any) {
    const fileUrl = await this.AttendanceService.exportExcel(body)

    return {
      data: {
        download_url: fileUrl,
      },
    }
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
