import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to generate Excel template for student import
 * Run: npx ts-node scripts/generate-excel-template.ts
 */

// Define headers
const headers = [
  // Student Information (Required)
  'student_ID',
  'name',
  'ic',
  'identity_type',
  'birthdate',
  'gender',
  'race',
  'religion',
  'citizenship',
  'origin_country',
  'orphan_status',
  'account_bank_no',
  'account_bank_name',
  
  // Parent Information (Optional)
  'guardian_type',
  'guardian_name',
  'parent_identity_type',
  'parent_ic',
  'relation',
  'occupation',
  'occupation_status',
  'employer_name',
  'income',
  'office_phone_no',
  'mobile_phone_no',
  'no_of_dependents',
  
  // OKU Information (Optional)
  'oku_status',
  'oku_verification_date',
  'oku_registration_no',
  'oku_registration_date',
  'oku_card_date',
  'oku_category_type',
  'oku_sub_category',
  
  // Academic Information (Optional)
  'study_status',
  'school_enrollment_date',
  'class_enrollment_date',
  'academic_year_level',
  'class_name',
  'dlp_status',
  'class_type',
  'stream_desc',
  'field_desc',
  'class_teacher_name',
];

// Sample data
const sampleData = [
  {
    student_ID: 'S2024001',
    name: 'Ahmad Bin Ali',
    ic: '010101010101',
    identity_type: 'MyKad',
    birthdate: '01/01/2001',
    gender: 1,
    race: 'Melayu',
    religion: 'Islam',
    citizenship: 'Malaysia',
    origin_country: 'Malaysia',
    orphan_status: '',
    account_bank_no: '1234567890',
    account_bank_name: 'Maybank',
    guardian_type: 'Ibu',
    guardian_name: 'Puan Fatimah',
    parent_identity_type: 'MyKad',
    parent_ic: '750101010101',
    relation: 'Ibu',
    occupation: 'Guru',
    occupation_status: 'Bekerja',
    employer_name: 'SK Taman Bestari',
    income: 3500,
    office_phone_no: '0312345678',
    mobile_phone_no: '0123456789',
    no_of_dependents: 3,
    oku_status: 'no',
    oku_verification_date: '',
    oku_registration_no: '',
    oku_registration_date: '',
    oku_card_date: '',
    oku_category_type: '',
    oku_sub_category: '',
    study_status: 'Aktif',
    school_enrollment_date: '02/01/2024',
    class_enrollment_date: '02/01/2024',
    academic_year_level: 'Tingkatan 6',
    class_name: '6 Amanah',
    dlp_status: 'Tidak',
    class_type: 'Sains',
    stream_desc: 'Sains Tulen',
    field_desc: 'Fizik, Kimia, Biologi',
    class_teacher_name: 'Cikgu Aminah',
  },
  {
    student_ID: 'S2024002',
    name: 'Siti Binti Hassan',
    ic: '020202020202',
    identity_type: 'MyKad',
    birthdate: '02/02/2002',
    gender: 2,
    race: 'Melayu',
    religion: 'Islam',
    citizenship: 'Malaysia',
    origin_country: 'Malaysia',
    orphan_status: '',
    account_bank_no: '9876543210',
    account_bank_name: 'CIMB',
    guardian_type: 'Bapa',
    guardian_name: 'Encik Hassan',
    parent_identity_type: 'MyKad',
    parent_ic: '740202020202',
    relation: 'Bapa',
    occupation: 'Peniaga',
    occupation_status: 'Bekerja Sendiri',
    employer_name: 'Kedai Runcit Hassan',
    income: 4000,
    office_phone_no: '',
    mobile_phone_no: '0198765432',
    no_of_dependents: 4,
    oku_status: 'yes',
    oku_verification_date: '15/01/2024',
    oku_registration_no: 'OKU2024001',
    oku_registration_date: '10/01/2024',
    oku_card_date: '20/01/2024',
    oku_category_type: 'Penglihatan',
    oku_sub_category: 'Rabun',
    study_status: 'Aktif',
    school_enrollment_date: '02/01/2024',
    class_enrollment_date: '02/01/2024',
    academic_year_level: 'Tingkatan 6',
    class_name: '6 Bestari',
    dlp_status: 'Ya',
    class_type: 'Sastera',
    stream_desc: 'Sastera',
    field_desc: 'Sejarah, Geografi, Kesusasteraan',
    class_teacher_name: 'Cikgu Razak',
  },
];

function generateTemplate() {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet with sample data
  const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
  
  // Set column widths
  const colWidths = headers.map(h => ({ wch: Math.max(h.length + 2, 15) }));
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  
  // Create templates directory if not exists
  const templatesDir = path.join(__dirname, '..', 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // Write file
  const filePath = path.join(templatesDir, 'student_import_template.xlsx');
  XLSX.writeFile(wb, filePath);
  
  console.log(`✅ Excel template generated successfully!`);
  console.log(`📁 Location: ${filePath}`);
  console.log(`\n📝 Template includes:`);
  console.log(`   - ${headers.length} columns`);
  console.log(`   - ${sampleData.length} sample rows`);
  console.log(`\n💡 You can use this template to import student data.`);
  console.log(`   Just replace the sample data with your actual data.`);
}

// Run the generator
generateTemplate();
