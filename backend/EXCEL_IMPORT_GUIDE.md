# Excel Import Template untuk Student Data

## Format Excel yang diperlukan

File Excel anda perlu mengandungi header columns berikut (row pertama):

### Student Information (Wajib)
- `student_ID` - ID pelajar (WAJIB, unique)
- `name` - Nama pelajar
- `ic` - No. IC (WAJIB, unique)
- `identity_type` - Jenis pengenalan (contoh: "MyKad", "Passport")
- `birthdate` - Tarikh lahir (format: DD/MM/YYYY atau YYYY-MM-DD)
- `gender` - Jantina (1 = Lelaki, 2 = Perempuan)
- `race` - Bangsa
- `religion` - Agama
- `citizenship` - Kewarganegaraan
- `origin_country` - Negara asal
- `orphan_status` - Status yatim (1 = Yatim piatu, 2 = Kehilangan ibu, 3 = Kehilangan ayah)
- `account_bank_no` - No. akaun bank
- `account_bank_name` - Nama bank

### Parent/Guardian Information (Optional)
- `guardian_type` - Jenis penjaga
- `guardian_name` - Nama penjaga
- `parent_identity_type` - Jenis pengenalan penjaga
- `parent_ic` - No. IC penjaga
- `relation` - Hubungan dengan pelajar
- `occupation` - Pekerjaan
- `occupation_status` - Status pekerjaan
- `employer_name` - Nama majikan
- `income` - Pendapatan (number)
- `office_phone_no` - No. telefon pejabat
- `mobile_phone_no` - No. telefon bimbit
- `no_of_dependents` - Bilangan tanggungan (number)

### OKU Information (Optional)
- `oku_status` - Status OKU (true/false, yes/no, ya/tidak, 1/0)
- `oku_verification_date` - Tarikh pengesahan OKU
- `oku_registration_no` - No. pendaftaran OKU
- `oku_registration_date` - Tarikh pendaftaran OKU
- `oku_card_date` - Tarikh kad OKU
- `oku_category_type` - Kategori OKU
- `oku_sub_category` - Sub-kategori OKU

### Academic Information (Optional)
- `study_status` - Status pengajian
- `school_enrollment_date` - Tarikh daftar sekolah
- `class_enrollment_date` - Tarikh daftar kelas
- `academic_year_level` - Tahun pengajian
- `class_name` - Nama kelas
- `dlp_status` - Status DLP
- `class_type` - Jenis kelas
- `stream_desc` - Aliran
- `field_desc` - Bidang
- `class_teacher_name` - Nama guru kelas

## Contoh Data

| student_ID | name | ic | identity_type | birthdate | gender | race | religion | guardian_name | parent_ic | mobile_phone_no | oku_status | class_name |
|------------|------|-----|---------------|-----------|--------|------|----------|---------------|-----------|----------------|------------|------------|
| S2024001 | Ahmad Bin Ali | 010101010101 | MyKad | 01/01/2001 | 1 | Melayu | Islam | Puan Fatimah | 750101010101 | 0123456789 | no | 6 Amanah |
| S2024002 | Siti Binti Hassan | 020202020202 | MyKad | 02/02/2002 | 2 | Melayu | Islam | Encik Hassan | 740202020202 | 0198765432 | yes | 6 Bestari |

## Cara Menggunakan

### 1. Prepare Excel File
- Buat file Excel baru (.xlsx atau .xls)
- Row pertama mesti header columns seperti di atas
- Isi data dari row kedua ke bawah
- Pastikan `student_ID` dan `ic` adalah unique untuk setiap pelajar

### 2. Upload melalui API

**Endpoint:** `POST /student/import`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Excel file anda

### 3. Contoh menggunakan cURL

```bash
curl -X POST http://localhost:3000/student/import \
  -F "file=@/path/to/your/students.xlsx"
```

### 4. Contoh menggunakan Postman

1. Pilih method: POST
2. URL: `http://localhost:3000/student/import`
3. Pergi ke tab "Body"
4. Pilih "form-data"
5. Tambah key: `file`, type: File
6. Upload file Excel anda
7. Click "Send"

### 5. Response Format

```json
{
  "success": true,
  "totalRows": 100,
  "successCount": 98,
  "failedCount": 2,
  "errors": [
    {
      "row": 5,
      "studentId": "S2024005",
      "error": "Student dengan ID S2024005 atau IC 050505050505 sudah wujud"
    },
    {
      "row": 10,
      "studentId": "",
      "error": "student_ID dan IC adalah wajib"
    }
  ],
  "message": "Import selesai: 98 berjaya, 2 gagal"
}
```

## Notes Penting

1. **Field Wajib**: `student_ID` dan `ic` mesti diisi
2. **Unique Constraint**: `student_ID` dan `ic` mesti unique (tidak boleh duplicate)
3. **Date Format**: Tarikh boleh dalam format DD/MM/YYYY atau YYYY-MM-DD
4. **Number Format**: Gender, orphan_status, income, no_of_dependents mesti number
5. **Boolean Format**: oku_status boleh: true/false, yes/no, ya/tidak, 1/0
6. **Transaction**: Setiap row diproses dalam transaction - jika gagal, data untuk row tersebut tidak akan disimpan
7. **Related Data**: Parent, OKU, dan Academic data hanya akan disimpan jika ada data yang diisi

## Error Handling

System akan:
- Skip row yang ada error
- Continue process row lain
- Return list of errors dengan row number
- Rollback transaction untuk row yang gagal
- Commit transaction untuk row yang berjaya

## Tips

1. Test dengan beberapa row dulu sebelum import banyak data
2. Pastikan format date konsisten
3. Check duplicate student_ID dan IC sebelum import
4. Simpan backup data sebelum import
5. Review error messages untuk betulkan data yang gagal
