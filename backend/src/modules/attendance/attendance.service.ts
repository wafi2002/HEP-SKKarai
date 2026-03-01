import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceStatus, StudentAttendance } from 'src/entities/StudentAttendance.entity';
import { Repository } from 'typeorm';
import { Class } from 'src/entities/Class.entity';
import { StudentAcademic } from 'src/entities/StudentAcademic.entity';
import { AttendanceSession } from 'src/entities/AttendanceSession';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(StudentAttendance)
    private attendanceRepository: Repository<StudentAttendance>,

    @InjectRepository(AttendanceSession)
    private sessionRepository: Repository<AttendanceSession>,

    @InjectRepository(StudentAcademic)
    private studentAcademicRepository: Repository<StudentAcademic>,

    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ){}
  
  async create(dto: CreateAttendanceDto, teacherId: string) {
    const classEntity = await this.classRepository.findOne({
      where: { id: dto.class_ID },
    });

    if (!classEntity) {
      throw new NotFoundException(`Kelas dengan ID ${dto.class_ID} tidak dijumpai.`);
    }

    // Fetch semua murid dalam kelas ini
    const studentAcademics = await this.studentAcademicRepository.find({
      where: { class: { id: dto.class_ID } },
      relations: ['student', 'class'],
    });

    if (studentAcademics.length === 0) {
      throw new NotFoundException(`Tiada murid dijumpai dalam kelas ini.`);
    }

    // Set absent student IDs untuk mudah lookup
    const absentMap = new Map(
      dto.absent_students.map((s) => [s.student_ID, s]),
    );

    const recordsToSave: StudentAttendance[] = [];

    for (const academic  of studentAcademics) {
      const student = academic.student;
      // Semak kalau rekod untuk murid + tarikh + kelas dah wujud
      let existing = await this.attendanceRepository.findOne({
        where: {
          student: { student_ID: student.student_ID },
          class: { id: dto.class_ID },
          date: new Date(dto.date) as any,
        },
        relations: ['student', 'class'],
      });

      if (!existing) {
        existing = this.attendanceRepository.create({
          student: { student_ID: student.student_ID },
          class: { id: dto.class_ID },
          date: new Date(dto.date) as any,
          recordedBy: { id: teacherId },
          recorded_at: new Date(),
        });
      }

      if (absentMap.has(student.student_ID)) {
        const absentInfo = absentMap.get(student.student_ID)!;
        existing.status = this.mapReasonToStatus(absentInfo.reason);
        existing.reason = absentInfo.note ?? absentInfo.reason;
      } else {
        existing.status = AttendanceStatus.PRESENT;
        existing.reason = null;
      }

      recordsToSave.push(existing);
    }

    await this.attendanceRepository.save(recordsToSave);

    // save session record
    const existingSession = await this.sessionRepository.findOne({
      where: { class: { id: dto.class_ID }, date: new Date(dto.date) as any }
    });

    if (!existingSession) {
      await this.sessionRepository.save(
        this.sessionRepository.create({
          class: { id: dto.class_ID },
          date: new Date(dto.date) as any,
          recordedBy: { id: teacherId },
        })
      );
    }

    return {
      message: 'Student records saved successfully.',
      class: classEntity.class_name,
      date: dto.date,
      total: studentAcademics.length,
      present: studentAcademics.length - dto.absent_students.length,
      absent: dto.absent_students.length,
    };
  }

  findAll() {
    return `This action returns all parent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parent`;
  }

  update(id: number, UpdateAttendanceDto: UpdateAttendanceDto) {
    return `This action updates a #${id} parent`;
  }

  remove(id: number) {
    return `This action removes a #${id} parent`;
  }

  async findByClass(class_ID: string) {
    const attendances = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .select([
        'attendance.id',
        'attendance.date',
        'attendance.status',
        'attendance.reason',
        'attendance.proof_file',
        'attendance.created_by',
        'attendance.recorded_at',
      ])
      .leftJoin('attendance.class', 'class')
      .addSelect([
        'class.class_name',
        'class.class_teacher_name',
        'class.academic_year_level',
      ])
      .leftJoin('attendance.student', 'student')
      .addSelect([
        'student.id',
        'student.name',
        'student.student_ID',
      ])
      .where('class.id = :class_ID', { class_ID })
      .orderBy('attendance.date', 'DESC')
      .addOrderBy('student.name', 'ASC')
      .getMany();

    return attendances;
  }

  // Helper to map reason string -> attendance status enum
  private mapReasonToStatus(reason: string): AttendanceStatus {
    const map: Record<string, AttendanceStatus> = {
      'Sakit': AttendanceStatus.SICK,
      'Tidak Hadir Tanpa Sebab': AttendanceStatus.ABSENT,
      'Hal Keluarga': AttendanceStatus.EXCUSED,
      'Bencana Alam': AttendanceStatus.EXCUSED,
      'Lain-lain': AttendanceStatus.UNCERTAIN,
    };
    return map[reason] ?? AttendanceStatus.ABSENT;
  }

  async checkSession(class_ID: string, date: string) {
    const session = await this.sessionRepository.findOne({
      where: { class: { id: class_ID }, date: new Date(date) as any },
      relations: ['recordedBy'],
    });

    return {
      taken: !!session,
      recorded_at: session?.created_at ?? null,
      recorded_by: session?.recordedBy ?? null,
    };
  }
}
