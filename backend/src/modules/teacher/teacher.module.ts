import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { Teacher } from '../../entities/Teacher.entity';
import { TeachingSchedule } from '../../entities/TeachingSchedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Teacher,
      TeachingSchedule,
    ]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
