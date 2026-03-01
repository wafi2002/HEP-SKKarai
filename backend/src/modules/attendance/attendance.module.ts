import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { StudentAttendance } from 'src/entities/StudentAttendance.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { Class } from 'src/entities/Class.entity';
import { StudentAcademic } from 'src/entities/StudentAcademic.entity';
import { AttendanceSession } from 'src/entities/AttendanceSession';


@Module({
  imports: [
      TypeOrmModule.forFeature([Class, StudentAttendance, StudentAcademic, AttendanceSession])
    ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService]
})
export class AttendanceModule {}
