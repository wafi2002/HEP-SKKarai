import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceStatus, StudentAttendance } from 'src/entities/StudentAttendance.entity';
import { Repository } from 'typeorm';
import { Class } from 'src/entities/Class.entity';
import { StudentAcademic } from 'src/entities/StudentAcademic.entity';
import { AttendanceSession } from 'src/entities/AttendanceSession';
import { Student } from 'src/entities/Student.entity';
import * as ExcelJS from 'exceljs'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config()

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

    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ){}

  async exportExcel(payload: any) {
    const { class_ID, date_from, date_to } = payload

    // 1️⃣ Get students
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.class', 'class')
      .where('class.id = :class_ID', { class_ID })
      .addSelect([
        'class.academic_year_level',
        'class.class_name',
      ])
      .getMany()

    // 2️⃣ Get absences
    const absences = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.class_ID = :class_ID', { class_ID })
      .andWhere('attendance.date BETWEEN :from AND :to', {
        from: date_from,
        to: date_to,
      })
      .getMany()

    // 3️⃣ Convert absences → Map by (date + student_ID)
    const absenceMap = new Map()

    absences.forEach(a => {
      const formattedDate = new Date(a.date).toISOString().substring(0, 10)
      const key = `${formattedDate}_${a.student.student_ID}`
      absenceMap.set(key, a)
    })

    // 4️⃣ Generate date range
    const dates: string[] = []
    let current = new Date(date_from)
    const end = new Date(date_to)

    while (current <= end) {
      dates.push(current.toISOString().substring(0, 10))
      current.setDate(current.getDate() + 1)
    }

    // 5️⃣ Create workbook
    const workbook = new ExcelJS.Workbook()

    // 6️⃣ Loop each date → create sheet
    for (const date of dates) {
      const sheet = workbook.addWorksheet(date)

      // ── 1. Define columns with widths ──────────────────────────
      sheet.columns = [
        { header: 'Name',              key: 'name',      width: 75 },
        { header: 'IC',                key: 'ic',        width: 20 },
        { header: 'Student ID',        key: 'studentId', width: 20 },
        { header: 'Students Class',    key: 'className', width: 25 },
        { header: 'Attendance Status', key: 'status',    width: 20 },
        { header: 'Reason',            key: 'reason',    width: 50 },
      ]

      // ── 2. Style the header row ────────────────────────────────
      const headerRow = sheet.getRow(1)
      headerRow.eachCell(cell => {
        cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 11 }
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border    = {
          top:    { style: 'thin' }, bottom: { style: 'thin' },
          left:   { style: 'thin' }, right:  { style: 'thin' },
        }
      })
      headerRow.height = 20

      // ── 3. Freeze the header row ───────────────────────────────
      sheet.views = [{ state: 'frozen', ySplit: 1 }]

      // ── 4. Fill data rows ──────────────────────────────────────
      students.forEach(student => {
        const key     = `${date}_${student.student_ID}`
        const absence = absenceMap.get(key)
        const className = `${student.class.academic_year_level} ${student.class.class_name}`
        const isAbsent  = !!absence

        const row = sheet.addRow({
          name:      student.name,
          ic:        student.ic,
          studentId: student.student_ID,
          className,
          status:    isAbsent ? 'Absent' : 'Present',
          reason:    absence?.reason || '-',
        })

        // Color: light red for Absent, light green for Present
        const rowColor = isAbsent ? 'FFFFC7CE' : 'FFC6EFCE'
        const textColor = isAbsent ? 'FF9C0006' : 'FF276221'

        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowColor } }
          cell.font = { name: 'Arial', size: 10, color: { argb: textColor } }
          cell.border = {
            top:    { style: 'thin', color: { argb: 'FFD3D3D3' } },
            bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            left:   { style: 'thin', color: { argb: 'FFD3D3D3' } },
            right:  { style: 'thin', color: { argb: 'FFD3D3D3' } },
          }
          cell.alignment = { vertical: 'middle' }
        })

        row.height = 18
      })

      // ── 5. Add a summary row at the bottom ────────────────────
      const totalRows  = students.length
      const absentCount  = students.filter(s => absenceMap.has(`${date}_${s.student_ID}`)).length
      const presentCount = totalRows - absentCount

      sheet.addRow([]) // blank spacer
      const summaryRow = sheet.addRow(['', '', '', `Total: ${totalRows}`, `Absent: ${absentCount}  Present: ${presentCount}`, ''])
      summaryRow.eachCell(cell => {
        cell.font = { bold: true, name: 'Arial', size: 10 }
      })
    }

    // 7️⃣ Save file
    const fileName = `attendance_${Date.now()}.xlsx`
    const uploadDir = path.join(__dirname, '../../../uploads')

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, fileName)
    await workbook.xlsx.writeFile(filePath)

    console.debug('[EXPORT EXCEL] download_url:', `${process.env.BASE_URL}/uploads/${fileName}`)

    // 8️⃣ Return URL
    return `${process.env.BASE_URL}/uploads/${fileName}`
  }
  
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
