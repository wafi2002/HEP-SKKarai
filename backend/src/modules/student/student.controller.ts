import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  HttpStatus,
  HttpCode,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  /**
   * Import students from Excel file
   * POST /student/import
   * Content-Type: multipart/form-data
   * Body: file (Excel file)
   */
  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    // TODO: Get userId from authenticated user session/JWT
    // For now using hardcoded value
  ) {
    if (!file) {
      throw new BadRequestException('File Excel diperlukan');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File mesti dalam format Excel (.xls atau .xlsx)');
    }

    // TODO: Replace with actual user ID from authentication
    const userId = 'system';

    return this.studentService.importFromExcel(file, userId);
  }

  @Get()
  async findAll(@Query() queryDto: QueryStudentsDto) {
    return await this.studentService.findAll(queryDto);
  }

  @Get(':student_ID')  // ✅ Tukar param name dari :id ke :student_ID
  async getStudentDetails(@Param('student_ID') student_ID: string) {
    return this.studentService.getStudentDetails(student_ID);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentService.remove(+id);
  }

  @Get('fetch-students/:class_ID')
  findByClass(@Param('class_ID') class_ID: string){
    return this.studentService.findByClass(class_ID);
  }
}
