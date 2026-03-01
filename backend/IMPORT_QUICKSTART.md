# Student Excel Import - Quick Start Guide

## 🚀 Cara Menggunakan Import Excel

### 1️⃣ Setup (Sudah Siap!)

Package yang diperlukan sudah installed:
- ✅ `xlsx` - untuk read Excel files
- ✅ `@types/xlsx` - TypeScript types
- ✅ `multer` - untuk file upload
- ✅ `@types/multer` - TypeScript types

### 2️⃣ API Endpoint

**URL:** `POST http://localhost:3000/student/import`

**Content-Type:** `multipart/form-data`

**Parameter:** `file` (Excel file)

### 3️⃣ Format Excel

#### Columns Wajib:
- `student_ID` - ID pelajar (unique)
- `ic` - No. IC (unique)

#### Columns Optional (Student):
- `name`, `identity_type`, `birthdate`, `gender`, `race`, `religion`, `citizenship`, `origin_country`, `orphan_status`, `account_bank_no`, `account_bank_name`

#### Columns Optional (Parent):
- `guardian_type`, `guardian_name`, `parent_identity_type`, `parent_ic`, `relation`, `occupation`, `occupation_status`, `employer_name`, `income`, `office_phone_no`, `mobile_phone_no`, `no_of_dependents`

#### Columns Optional (OKU):
- `oku_status`, `oku_verification_date`, `oku_registration_no`, `oku_registration_date`, `oku_card_date`, `oku_category_type`, `oku_sub_category`

#### Columns Optional (Academic):
- `study_status`, `school_enrollment_date`, `class_enrollment_date`, `academic_year_level`, `class_name`, `dlp_status`, `class_type`, `stream_desc`, `field_desc`, `class_teacher_name`

### 4️⃣ Contoh Data Excel

| student_ID | name | ic | birthdate | gender | race | guardian_name | parent_ic | mobile_phone_no | class_name |
|------------|------|-----|-----------|--------|------|---------------|-----------|----------------|------------|
| S2024001 | Ahmad Bin Ali | 010101010101 | 01/01/2001 | 1 | Melayu | Puan Fatimah | 750101010101 | 0123456789 | 6 Amanah |
| S2024002 | Siti Binti Hassan | 020202020202 | 02/02/2002 | 2 | Melayu | Encik Hassan | 740202020202 | 0198765432 | 6 Bestari |

### 5️⃣ Test dengan Postman

1. Buka Postman
2. Create new request: `POST`
3. URL: `http://localhost:3000/student/import`
4. Tab "Body" → pilih "form-data"
5. Add key: `file`, type: `File`
6. Select Excel file anda
7. Click "Send"

### 6️⃣ Test dengan cURL

```bash
curl -X POST http://localhost:3000/student/import \
  -F "file=@C:\path\to\your\students.xlsx"
```

### 7️⃣ Response Example

**Success:**
```json
{
  "success": true,
  "totalRows": 2,
  "successCount": 2,
  "failedCount": 0,
  "errors": [],
  "message": "Import selesai: 2 berjaya, 0 gagal"
}
```

**With Errors:**
```json
{
  "success": false,
  "totalRows": 3,
  "successCount": 2,
  "failedCount": 1,
  "errors": [
    {
      "row": 3,
      "studentId": "S2024003",
      "error": "Student dengan ID S2024003 atau IC 030303030303 sudah wujud"
    }
  ],
  "message": "Import selesai: 2 berjaya, 1 gagal"
}
```

## 📋 Important Notes

### Data Types:
- **gender**: 1 = Lelaki, 2 = Perempuan
- **orphan_status**: 1 = Yatim piatu, 2 = Kehilangan ibu, 3 = Kehilangan ayah
- **oku_status**: yes/no, true/false, ya/tidak, 1/0
- **dates**: DD/MM/YYYY atau YYYY-MM-DD
- **numbers**: income, no_of_dependents (tanpa comma)

### Features:
- ✅ Transaction per row (jika gagal, rollback untuk row tersebut sahaja)
- ✅ Duplicate detection (student_ID dan IC)
- ✅ Automatic relationship creation (Parent, OKU, Academic)
- ✅ Detailed error reporting dengan row number
- ✅ Support .xls dan .xlsx files

### Tips:
1. Test dengan 2-3 rows dulu
2. Pastikan student_ID dan IC unique
3. Format date konsisten
4. Simpan backup sebelum import besar
5. Check error messages untuk fix data yang gagal

## 🔧 Generate Template Excel

Untuk generate template Excel dengan sample data:

```bash
npx ts-node scripts/generate-excel-template.ts
```

Template akan dijana di: `backend/templates/student_import_template.xlsx`

## 📞 Need Help?

Refer to `EXCEL_IMPORT_GUIDE.md` untuk detailed documentation.
