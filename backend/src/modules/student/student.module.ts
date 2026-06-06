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
import { Permission } from '../../entities/Permission.entity';
import { SystemFunction } from '../../entities/SystemFunction.entity';
import { UserGroupPermission } from '../../entities/UserGroupPermission.entity';
import { PermissionsGuard } from '../auth/guards/permissions/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student, Parent, StudentOku, StudentAcademic, Class, Address,
      Permission, SystemFunction, UserGroupPermission,
    ])
  ],
  controllers: [StudentController],
  providers: [StudentService, PermissionsGuard],
  exports: [StudentService],
})
export class StudentModule {}
