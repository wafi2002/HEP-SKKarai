// dto/teaching-schedule-response.dto.ts
import { Expose, Type } from 'class-transformer';

export class TeacherDto {
  @Expose()
  id: string;

  @Expose()
  subject: string;

  @Expose()
  qualification: string;
}

export class ClassDto {
  @Expose()
  id: string;

  @Expose()
  class_name: string;

  @Expose()
  class_type: string;

  @Expose()
  class_teacher_name: string;
}

export class TeachingScheduleDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => TeacherDto)
  teacher: TeacherDto;

  @Expose()
  @Type(() => ClassDto)
  class: ClassDto;

  @Expose()
  day_of_week: string;

  @Expose()
  start_time: string;

  @Expose()
  end_time: string;

  @Expose()
  is_class_period: boolean;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}

export class TeachingScheduleListResponseDto {
  @Expose()
  @Type(() => TeachingScheduleDto)
  items: TeachingScheduleDto[];

  @Expose()
  total: number;
}