import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ImportResultDto, ImportErrorDto } from './dto/import-result.dto';
import { Student } from '../../entities/Student.entity';
import { Parent } from '../../entities/Parent.entity';
import { StudentOku } from '../../entities/StudentOku.entity';
import { StudentAcademic } from '../../entities/StudentAcademic.entity';
import { Class } from '../../entities/Class.entity';
import { Address } from '../../entities/Address.entity';  
import { QueryStudentsDto } from './dto/query-students.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(StudentOku)
    private studentOkuRepository: Repository<StudentOku>,
    @InjectRepository(StudentAcademic)
    private studentAcademicRepository: Repository<StudentAcademic>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private dataSource: DataSource,
  ) {}

  create(createStudentDto: CreateStudentDto) {
    return 'This action adds a new student';
  }

  /**
   * Get All student
   */
  async findAll(queryDto: QueryStudentsDto) {
    const { 
      page = 1, 
      itemsPerPage = 10, 
      sortBy, 
      sortOrder = 'asc',
      search,
      academic_year_level
    } = queryDto;
    
    const skip = (page - 1) * itemsPerPage;
    
    // Build query
    const queryBuilder = this.studentRepository.createQueryBuilder('student')
    // Select column dr student
    .select([
      'student.id',
      'student.student_ID',
      'student.name',
      'student.ic',
      'student.race'
    ])
    // Join table academic
    .leftJoin('student.academic', 'academic')
    .leftJoin('academic.class', 'class')
    .addSelect([
      'academic.study_status',
      'academic.stream_desc',
      'class.class_name',
      'class.class_teacher_name',
      'class.class_type',
      'class.academic_year_level'
    ])

    .leftJoin('student.parents', 'parents')
    .addSelect([
      'parents.guardian_name',
      'parents.ic',
      'parents.relation',
      'parents.occupation',
      'parents.mobile_phone_no',
    ])

    .leftJoin('student.address', 'address')
    .addSelect([
      'address.address_1',
      'address.address_2',
      'address.address_3',
      'address.postcode',
      'address.city',
      'address.region',
      'address.state',
    ]);
    
    // Add sorting if provided
    if (sortBy) {
      queryBuilder.orderBy(`student.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      // Default sorting
      queryBuilder.orderBy('student.id', 'DESC');
    }

    // Class
    if (academic_year_level) {
      queryBuilder.andWhere(
          'class.academic_year_level = :academic_year_level',
          { academic_year_level }
      );
  }

     // search
    if (search) {
      queryBuilder.andWhere(  
        '(student.name ILIKE :name OR student.ic = :ic)',
        { name: `%${search}%`, ic: search }
      );
    }
    
    // Add pagination
    queryBuilder.skip(skip).take(itemsPerPage);
    
    // Execute query
    const [items, total] = await queryBuilder.getManyAndCount();
    
    return {
      items,
      total,
      page,
      itemsPerPage,
      totalPages: Math.ceil(total / itemsPerPage),
    };
  }

  async getStudentDetails(student_ID: string) {
    return await this.studentRepository.findOne({
      where: { student_ID },
      relations: ['academic', 'address', 'parents', 'academic.class'],
    });
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }

  /**
   * Import students data from Excel file
   */
  async importFromExcel(file: Express.Multer.File, userId: string): Promise<ImportResultDto> {
    const errors: ImportErrorDto[] = [];
    let successCount = 0;
    let failedCount = 0;

    const normalizeClassName = (name: string) => name
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

     const normalizeYearLevel = (year: string): string =>
      year.trim().toUpperCase();

    const makeClassKey = (className: string, yearLevel: string): string =>
      `${normalizeClassName(className)}|${normalizeYearLevel(yearLevel)}`;

    try {
      // Read Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON starting from row 6
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        range: 5, // Row 6 (0-indexed, so 5 = row 6)
        defval: '',
        blankrows: false,
      });

      if (!rawData || rawData.length === 0) {
        throw new BadRequestException('Excel file is empty or the format is incorrect');
      }

      // Normalize column names and map data
      const data = rawData.map(row => {
        const normalizedRow: any = {};
        for (const key in row) {
          // SKIP empty columns and empty values
          if (key.startsWith('__EMPTY') || 
              key.includes('SENARAI') || 
              !row[key] || 
              row[key].toString().trim() === '') {
            continue;
          }

          // Normalize column name
          const normalizedKey = key
            .trim()
            .toLowerCase()
            .replace(/[.\s\/]+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
          
          // Map common variations to standard names
          const columnMapping: { [key: string]: string } = {
            // Student
            'id_murid': 'student_ID',
            'nama': 'name',
            'no_pengenalan': 'ic',
            'jenis_pengenalan': 'identity_type',
            'tarikh_lahir': 'birthdate',
            'jantina': 'gender',
            'kaum': 'race',
            'agama': 'religion',
            'warganegara': 'citizenship',
            'negara_asal': 'origin_country',
            'status_yatim': 'orphan_status',
            'no_akaun_bank': 'account_bank_no',
            'nama_akaun_bank': 'account_bank_name',

            // Student Academic
            'status_pengajian': 'study_status',
            'tarikh_masuk_sekolah': 'school_enrollment_date',
            'tarikh_masuk_kelas': 'class_enrollment_date',
            'tahun_tingkatan': 'academic_year_level',
            'nama_kelas': 'class_name',
            'status_dlp': 'dlp_status',
            'jenis_kelas': 'class_type',
            'keterangan_aliran': 'stream_desc',
            'keterangan_bidang': 'field_desc',
            'nama_guru_kelas': 'class_teacher_name',
           
            // Student OKU
            'status_oku': 'oku_status',
            'tarikh_sah_oku': 'oku_approved_date',
            'no_pendaftaran_oku': 'oku_registration_no',
            'tarikh_daftar_oku': 'oku_registration_date',
            'tarikh_kad_oku': 'oku_card_date',
            'kategori_ketidakupayaan': 'oku_category_type',
            'subkategori_ketidakupayaan': 'oku_subcategory_type',

            // Student Hostel
            'status_asrama': 'hostel_status',
            'nama_asrama': 'hostel_name',
            
            // PENJAGA 1 (Primary Guardian)
            'jenis_penjaga_1': 'guardian_1_type', // father/mother/guardian
            'penjaga_1': 'guardian_1_name',
            'jns_pengenalan_penjaga_1': 'guardian_1_identity_type',
            'no_pengenalan_penjaga_1': 'guardian_1_ic',
            'hubungan_penjaga_1': 'guardian_1_relation',
            'pekerjaan_penjaga_1': 'guardian_1_occupation',
            'status_pekerjaan_penjaga_1': 'guardian_1_occupation_status',
            'nama_majikan_penjaga_1': 'guardian_1_employer_name',
            'pendapatan_penjaga_1': 'guardian_1_income',
            'no_tel_pejabat_penjaga_1': 'guardian_1_office_phone_no',
            'no_tel_bimbit_penjaga_1': 'guardian_1_mobile_phone_no',
            'tanggungan': 'guardian_1_no_of_dependents',
            
            // PENJAGA 2 (Secondary Guardian)
            'jenis_penjaga_2': 'guardian_2_type',
            'penjaga_2': 'guardian_2_name',
            'no_pengenalan_penjaga_2': 'guardian_2_ic',
            'jns_pengenalan_penjaga_2': 'guardian_2_identity_type',
            'hubungan_penjaga_2': 'guardian_2_relation',
            'pekerjaan_penjaga_2': 'guardian_2_occupation',
            'status_kerja_penjaga_2': 'guardian_2_occupation_status',
            'nama_majikan_penjaga_2': 'guardian_2_employer_name',
            'pendapatan_penjaga_2': 'guardian_2_income',
            'no_tel_pejabat_penjaga_2': 'guardian_2_office_phone_no',
            'no_tel_bimbit_penjaga_2': 'guardian_2_mobile_phone_no',

            // ALAMAT
            'alamat_1': 'address_1',
            'alamat_2': 'address_2',
            'alamat_3': 'address_3',
            'poskod': 'postcode',
            'bandar': 'city',
            'daerah': 'region',
            'negeri': 'state',
          };

          const mappedKey = columnMapping[normalizedKey] || normalizedKey;
          normalizedRow[mappedKey] = row[key];
        }
        return normalizedRow;
      }).filter(row => row.student_ID && row.ic); // Filter out rows without required fields

      console.log('✅ Sample normalized row:', data[0]);
      console.log('✅ Total valid rows:', data.length);

      // 🔥 STEP 1: PRE-CREATE ALL UNIQUE CLASSES
      console.log('\n🎯 ========== PHASE 1: PRE-CREATING CLASSES ==========');
      const uniqueClasses = new Map<string, any>();

      for (const row of data) {
        if (row.class_name && row.academic_year_level) {
          
          
          const classKey = makeClassKey(row.class_name, row.academic_year_level);
          
          // 🔥 FIX: Ambil class_teacher_name dari row yang ADA teacher name
          if (!uniqueClasses.has(classKey)) {
            uniqueClasses.set(classKey, {
              class_name: normalizeClassName(row.class_name),
              academic_year_level: normalizeYearLevel(row.academic_year_level),
              class_type: row.class_type || null,
              class_teacher_name: row.class_teacher_name || null,
            });
          } else {
            // 🔥 UPDATE: Kalau ada teacher name dalam row ni, update yang existing
            const existing = uniqueClasses.get(classKey);
            if (row.class_teacher_name && !existing.class_teacher_name) {
              existing.class_teacher_name = row.class_teacher_name;
            }
            if (row.class_type && !existing.class_type) {
              existing.class_type = row.class_type;
            }
          }
        }
      }

      // Create or find all classes BEFORE processing students
      const classMap = new Map<string, Class>();

      for (const [classKey, classData] of uniqueClasses) {
        try {
          // 🔥 STEP 1: Check if class exists first
          let classEntity = await this.dataSource.manager.findOne(Class, {
            where: { 
              class_name: classData.class_name,
              academic_year_level: classData.academic_year_level
            }
          });

          if (classEntity) {
            classMap.set(classKey, classEntity);
            continue; // Skip to next class
          }

          // 🔥 STEP 2: Try to create (with fallback if duplicate)
          try {
            classEntity = await this.dataSource.manager.save(Class, {
              class_name: classData.class_name,
              academic_year_level: classData.academic_year_level,
              class_type: classData.class_type,
              class_teacher_name: classData.class_teacher_name,
              created_by: userId,
              updated_by: userId,
            });
            
            classMap.set(classKey, classEntity);
            
          } catch (saveError) {
            // 🔥 FALLBACK: If duplicate, fetch the existing one
            if (saveError.code === '23505') {
              console.warn(`⚠️ Duplicate error during save, fetching existing class...`);
              
              classEntity = await this.dataSource.manager.findOne(Class, {
                where: { 
                  class_name: classData.class_name,
                  academic_year_level: classData.academic_year_level
                }
              });
              
              if (classEntity) {
                console.log(`♻️ Retrieved class ID: ${classEntity.id} after duplicate error`);
                classMap.set(classKey, classEntity);
              } else {
                console.error(`🚨 CRITICAL: Cannot find class after duplicate error for "${classData.class_name}"`);
                throw new Error(`Failed to create/find class: ${classData.class_name}`);
              }
            } else {
              console.error(`🚨 Unexpected error saving class "${classData.class_name}":`, saveError.message);
              throw saveError;
            }
          }
          
        } catch (error) {
          console.error(`🚨 ERROR processing class "${classData.class_name}":`, error.message);
          // Don't throw here, continue with other classes
          // The students using this class will get a warning later
        }
      }

      console.log(`\n✅ Class preparation complete! ${classMap.size} classes ready.`);
      console.log('🎯 ========== PHASE 2: IMPORTING STUDENTS ==========\n');

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 7; // Excel row (header is row 6, data starts row 7)

        // Start transaction for each student
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          // Validate required fields
          if (!row.student_ID || !row.ic) {
            errors.push({
              row: rowNumber,
              studentId: row.student_ID || 'N/A',
              error: `Student ID and IC are required. Detected: student_ID="${row.student_ID}", ic="${row.ic}"`,
            });
            failedCount++;
            await queryRunner.rollbackTransaction();
            continue;
          }

          // Check if student already exists
          const existingStudent = await queryRunner.manager.findOne(Student, {
            where: [
              { student_ID: row.student_ID },
              { ic: row.ic }
            ]
          });

          if (existingStudent) {
            errors.push({
              row: rowNumber,
              studentId: row.student_ID,
              error: `Student with ID ${row.student_ID} or IC ${row.ic} already exists`,
            });
            failedCount++;
            await queryRunner.rollbackTransaction();
            continue;
          }

          // Create Student entity
          const studentData: any = {
            student_ID: row.student_ID,
            name: row.name,
            ic: row.ic,
            identity_type: row.identity_type,
            created_by: userId,
            updated_by: userId,
          };

          // Parse date
          if (row.birthdate) {
            studentData.birthdate = this.parseDate(row.birthdate, 'birthdate');
          }

          if (row.gender) studentData.gender = row.gender;
          if (row.race) studentData.race = row.race;
          if (row.religion) studentData.religion = row.religion;
          if (row.citizenship) studentData.citizenship = row.citizenship;
          if (row.origin_country) studentData.origin_country = row.origin_country;
          if (row.orphan_status) studentData.orphan_status = row.orphan_status;
          if (row.account_bank_no) studentData.account_bank_no = row.account_bank_no;
          if (row.account_bank_name) studentData.account_bank_name = row.account_bank_name;

          const student = queryRunner.manager.create(Student, studentData);
          await queryRunner.manager.save(Student, student);

          // Create Parent entity if parent data exists
          const guardians = [
            { 
              name: row.guardian_1_name, 
              identity_type: row.guardian_1_identity_type,
              ic: row.guardian_1_ic, 
              relation: row.guardian_1_relation,
              occupation: row.guardian_1_occupation,
              occupation_status: row.guardian_1_occupation_status,
              employer_name: row.guardian_1_employer_name,
              income: row.guardian_1_income,
              office_phone_no: row.guardian_1_office_phone_no,
              mobile_phone_no: row.guardian_1_mobile_phone_no,
              no_of_dependents: row.guardian_1_no_of_dependents,
              order: 'primary'
            },
            { 
              name: row.guardian_2_name, 
              identity_type: row.guardian_2_identity_type,
              ic: row.guardian_2_ic, 
              relation: row.guardian_2_relation,
              occupation: row.guardian_2_occupation,
              occupation_status: row.guardian_2_occupation_status,
              employer_name: row.guardian_2_employer_name,
              income: row.guardian_2_income,
              office_phone_no: row.guardian_2_office_phone_no,
              mobile_phone_no: row.guardian_2_mobile_phone_no,
              no_of_dependents: row.guardian_2_no_of_dependents,
              order: 'secondary'
            },
          ];

          for (const g of guardians) {
            if (g.name || g.ic) {
              const parentData: any = {
                student: { student_ID: row.student_ID },
                guardian_order: g.order,
                guardian_name: g.name,
                ic: g.ic,
                identity_type: g.identity_type,
                relation: g.relation,
                occupation: g.occupation,
                occupation_status: g.occupation_status,
                employer_name: g.employer_name,
                income: g.income,
                office_phone_no: g.office_phone_no,
                mobile_phone_no: g.mobile_phone_no,
                no_of_dependents: g.no_of_dependents,
                created_by: userId,
                updated_by: userId,
              };

              try {
                await queryRunner.manager
                  .createQueryBuilder()
                  .insert()
                  .into(Parent)
                  .values(parentData)
                  .execute();
              } catch (parentError) {
                console.error(`🚨 [Row ${rowNumber}] ERROR inserting ${g.order} guardian for ${row.student_ID}:`, parentError.message);
                console.error(`🚨 [Row ${rowNumber}] Guardian IC: ${g.ic}`);
                console.error(`🚨 [Row ${rowNumber}] Error code:`, parentError.code);
                console.error(`🚨 [Row ${rowNumber}] Constraint:`, parentError.constraint);
                throw parentError;
              }
            }
          }

          // Create StudentOku entity if OKU data exists
          if (row.oku_status !== undefined && row.oku_status !== null && row.oku_status !== '') {
            const okuData: any = {
              student: { student_ID: row.student_ID },
              oku_status: (() => {
                const val = row.oku_status;

                if (typeof val === 'boolean') return val;

                if (typeof val === 'string') {
                  const lower = val.toLowerCase();
                  return lower === 'true' || lower === 'yes' || lower === 'ya' || lower === '1';
                }

                if (typeof val === 'number') return val === 1;

                return false;
              })(),
              created_by: userId,
              updated_by: userId,
            };

            if (row.oku_verification_date) okuData.oku_verification_date = this.parseDate(row.oku_verification_date);
            if (row.oku_registration_no) okuData.oku_registration_no = row.oku_registration_no;
            if (row.oku_registration_date) okuData.oku_registration_date = this.parseDate(row.oku_registration_date);
            if (row.oku_card_date) okuData.oku_card_date = this.parseDate(row.oku_card_date);
            if (row.oku_category_type) okuData.oku_category_type = row.oku_category_type;
            if (row.oku_sub_category) okuData.oku_sub_category = row.oku_sub_category;

            await queryRunner.manager
              .createQueryBuilder()
              .insert()
              .into(StudentOku)
              .values(okuData)
              .execute();
          }

          // Create StudentAcademic entity if academic data exists
          if (row.study_status || row.class_name || row.academic_year_level) {
            const academicData: any = {
              student: { student_ID: row.student_ID },
              created_by: userId,
              updated_by: userId,
            };
            
            if (row.study_status) academicData.study_status = row.study_status;
            if (row.school_enrollment_date) {
              academicData.school_enrollment_date = this.parseDate(row.school_enrollment_date, 'school_enrollment_date');
            }
            if (row.class_enrollment_date) {
              academicData.class_enrollment_date = this.parseDate(row.class_enrollment_date, 'class_enrollment_date');
            }
            if (row.academic_year_level) academicData.academic_year_level = row.academic_year_level;
            if (row.dlp_status) academicData.dlp_status = row.dlp_status;
            if (row.stream_desc) academicData.stream_desc = row.stream_desc;
            if (row.field_desc) academicData.field_desc = row.field_desc;

            // **Create/Find Class**
            if (row.class_name && row.academic_year_level) {
              const classKey = makeClassKey(row.class_name, row.academic_year_level);
              const classEntity = classMap.get(classKey);

              if (classEntity) {
                academicData.class = { id: classEntity.id };
              } else {
                console.warn(`⚠️ [Row ${rowNumber}] Class not found in map: ${classKey} - this should not happen!`);
              }
            } else if (row.class_name || row.academic_year_level) {
              console.warn(`⚠️ [Row ${rowNumber}] Incomplete class data: class_name="${row.class_name}", year="${row.academic_year_level}"`);
            }

            try {
              await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(StudentAcademic)
                .values(academicData)
                .execute();
            } catch (academicError) {
              console.error(`🚨 [Row ${rowNumber}] ERROR inserting StudentAcademic:`, academicError.message);
              throw academicError;
            }
          }

          // Create address
          if (row.address_1 && row.postcode && row.city && row.region && row.state) {
          
          const addressData: any = {
            student: { student_ID: row.student_ID },
            created_by: userId,
            updated_by: userId,
          };
          if (row.address_1) addressData.address_1 = row.address_1;
          if (row.address_2) addressData.address_2 = row.address_2;
          if (row.address_3) addressData.address_3 = row.address_3;
          if (row.postcode) addressData.postcode = row.postcode;
          if (row.city) addressData.city = row.city;
          if (row.region) addressData.region = row.region;
          if (row.state) addressData.state = row.state;

          try {
            await queryRunner.manager
              .createQueryBuilder()
              .insert()
              .into(Address)
              .values(addressData)
              .execute();
          } catch (addressError) {
            console.error(`🚨 [Row ${rowNumber}] ERROR inserting address for ${row.student_ID}:`, addressError.message);
            console.error(`🚨 [Row ${rowNumber}] Error code:`, addressError.code);
            console.error(`🚨 [Row ${rowNumber}] Constraint:`, addressError.constraint);
            throw addressError;
          }
        }

          // Commit transaction
          await queryRunner.commitTransaction();
          successCount++;

        } catch (error) {
          // Rollback transaction on error
          await queryRunner.rollbackTransaction();
          errors.push({
            row: rowNumber,
            studentId: row.student_ID,
            error: error.message || 'Error tidak diketahui',
          });
          failedCount++;
        } finally {
          await queryRunner.release();
        }
      }

      return {
        success: failedCount === 0,
        totalRows: data.length,
        successCount,
        failedCount,
        errors,
        message: `Import completed: ${successCount} successful, ${failedCount} failed`,
      };

    } catch (error) {
      throw new BadRequestException(`Error membaca file Excel: ${error.message}`);
    }
  }

  /**
   * Helper function to parse date from Excel
   */
  private parseDate(value: any, fieldName?: string): Date | null {
    if (!value) return null;
    
    try {
      // If it's already a Date object
      if (value instanceof Date) {
        if (isNaN(value.getTime())) {
          console.warn(`⚠️ Invalid Date object for ${fieldName}:`, value);
          return null;
        }
        return value;
      }
      
      // If it's an Excel serial number (typically > 1 for dates)
      if (typeof value === 'number') {
        // Excel serial dates start from 1900-01-01
        if (value < 1) {
          console.warn(`⚠️ Invalid Excel serial number for ${fieldName}:`, value);
          return null;
        }
        
        const date = XLSX.SSF.parse_date_code(value);
        const parsed = new Date(date.y, date.m - 1, date.d);
        
        if (isNaN(parsed.getTime())) {
          console.warn(`⚠️ Failed to parse Excel serial for ${fieldName}:`, value);
          return null;
        }
        
        return parsed;
      }
      
      // If it's a string, try to parse it
      if (typeof value === 'string') {
        const trimmed = value.trim();
        
        // Try different date formats
        const formats = [
          // ISO format: 2024-01-31
          new Date(trimmed),
          // DD/MM/YYYY
          (() => {
            const parts = trimmed.split('/');
            if (parts.length === 3) {
              return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
            return null;
          })(),
          // DD-MM-YYYY
          (() => {
            const parts = trimmed.split('-');
            if (parts.length === 3 && parts[2].length === 4) {
              return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
            return null;
          })(),
        ];
        
        for (const format of formats) {
          if (format && !isNaN(format.getTime())) {
            return format;
          }
        }
        
        console.warn(`⚠️ Failed to parse date string for ${fieldName}:`, trimmed);
        return null;
      }
      
      console.warn(`⚠️ Unknown date type for ${fieldName}:`, typeof value, value);
      return null;
      
    } catch (error) {
      console.error(`❌ Error parsing date for ${fieldName}:`, error.message, value);
      return null;
    }
  }

  private normalizeAcademicYear(yearText: string): string {
    if (!yearText) return '';

    const text = yearText.toString().trim().toLowerCase();
    
    const numberMap: { [key: string]: string } = {
      'satu': '1',
      'dua': '2',
      'tiga': '3',
      'empat': '4',
      'lima': '5',
      'enam': '6',
    };

    // For Prasekolah, just capitalize properly
    if (text === 'prasekolah') {
      return 'Prasekolah';
    }

    // Replace Malay number words with digits
    let normalized = text;
    for (const [word, digit] of Object.entries(numberMap)) {
      if (normalized.includes(word)) {
        normalized = normalized.replace(word, digit);
      }
    }

    // Capitalize first letter
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);

    return normalized.trim();
  }

  async findByClass(class_ID: string){
    // build query 
    const students = this.studentRepository.createQueryBuilder('student')
    .select([
      'student.student_ID',
      'student.name',
      'student.ic'
    ])
    // Join table academic
    .leftJoin('student.academic', 'academic')
    .leftJoin('academic.class', 'class')
    .addSelect([
      'academic.study_status',
      'academic.stream_desc',
      'class.class_name',
      'class.class_teacher_name',
      'class.class_type',
      'class.academic_year_level'
    ])
    .where('class.id = :class_ID', {class_ID})
    
    .getMany()

    return students;
  }
}