import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AbsentStudentDto {

  @IsString()
  @IsNotEmpty()
  student_ID: string;
  
  @IsString()
  @IsNotEmpty()
  student_name: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateAttendanceDto {
  @IsUUID()
  @IsNotEmpty()
  class_ID: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbsentStudentDto)
  absent_students: AbsentStudentDto[];
}