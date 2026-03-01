import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../../entities/Teacher.entity';
import { TeachingSchedule } from 'src/entities/TeachingSchedule.entity';
import { plainToInstance } from 'class-transformer';
import { TeachingScheduleListResponseDto } from './dto/teaching-schedule.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,

    @InjectRepository(TeachingSchedule)
    private teachingScheduleRepository: Repository<TeachingSchedule>,
  ) {}
  create(createTeacherDto: CreateTeacherDto) {
    return 'This action adds a new teacher';
  }

  findAll() {
    return `This action returns all teacher`;
  }

  findOne(id: number) {
    return `This action returns a #${id} teacher`;
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacher`;
  }

  async findTeacherByUserId(userId: string): Promise<Teacher | null> {
    return this.teacherRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async getTeachingSchedule(user: any){

    console.log(user);

    // Build Query 
    const teachingSchedule = this.teachingScheduleRepository.createQueryBuilder('teachingSchedule')

    // Select column from student
    teachingSchedule.select([
      'teachingSchedule.id',
      'teachingSchedule.teacher_ID',
      'teachingSchedule.class_ID',
      'teachingSchedule.day_of_week',
      'teachingSchedule.start_time',
      'teachingSchedule.end_time',
      'teachingSchedule.is_class_period',
      'teachingSchedule.created_at',
      'teachingSchedule.updated_at',
    ])

    if(user.role === 'Teacher'){
      teachingSchedule.where('teachingSchedule.teacher_ID = :teacher_ID', { teacher_ID: user.teacherId });
    }

    // Join table teacher
    teachingSchedule.leftJoin('teachingSchedule.teacher', 'teacher')

    // Select column from teacher
    teachingSchedule.addSelect([
      'teacher.id',
      'teacher.subject',
      'teacher.qualification'
    ])

    // Join table class
    teachingSchedule.leftJoin('teachingSchedule.class', 'class')

    // Select column from class
    teachingSchedule.addSelect([
      'class.id',
      'class.class_name',
      'class.class_type',
      'class.class_teacher_name'
    ])

    // Execute query
    const [items, total] = await teachingSchedule.getManyAndCount();
    
    return plainToInstance(TeachingScheduleListResponseDto, {
      items,
      total,
    }, { 
      excludeExtraneousValues: true 
    });

  }
}
