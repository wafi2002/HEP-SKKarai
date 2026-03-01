import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student } from '../../entities/Student.entity';
import { Parent } from '../../entities/Parent.entity';
import { StudentOku } from '../../entities/StudentOku.entity';
import { StudentAcademic } from '../../entities/StudentAcademic.entity';
import { Class } from '../../entities/Class.entity';
import { Address } from '../../entities/Address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Parent, StudentOku, StudentAcademic, Class, Address])
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
