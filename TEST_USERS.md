# Test Users — HEP SKKarai

Senarai akaun ujian untuk setiap user group. Guna credentials ini untuk test permission system.

---

## Akaun Ujian

| Nama | Username | Password | User Group |
|---|---|---|---|
| Admin HEP | `admin` | `password123` | Super Admin |
| Super Admin | `superadmin` | `superadmin123` | Super Admin |
| Guru Besar HEP | `gurubesar` | `gurubesar123` | Guru Besar |
| PK HEM | `pkhem` | `pkhem123` | PK HEM |
| Cikgu Ali | `gurubiasa` | `guru123` | Guru Biasa |

> Login di: **http://localhost:3000**

---

## Permission Matrix

### 1. Super Admin
Akses penuh kepada semua fungsi sistem.

| Function | View | Create | Edit | Delete |
|---|:---:|:---:|:---:|:---:|
| Student Management | ✅ | ✅ | ✅ | ✅ |
| Attendance Management | ✅ | ✅ | ✅ | ✅ |
| Financial Management | ✅ | ✅ | ✅ | ✅ |
| Report Management | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ✅ | ✅ | ✅ |

---

### 2. Guru Besar
Akses kepada pengurusan sekolah dan laporan.

| Function | View | Create | Edit | Delete |
|---|:---:|:---:|:---:|:---:|
| Student Management | ✅ | ✅ | ✅ | ✅ |
| Attendance Management | ✅ | ✅ | ✅ | ✅ |
| Financial Management | ✅ | ❌ | ❌ | ❌ |
| Report Management | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ | ❌ |

---

### 3. PK HEM
Akses kepada hal ehwal murid dan kehadiran.

| Function | View | Create | Edit | Delete |
|---|:---:|:---:|:---:|:---:|
| Student Management | ✅ | ✅ | ✅ | ✅ |
| Attendance Management | ✅ | ✅ | ✅ | ✅ |
| Financial Management | ❌ | ❌ | ❌ | ❌ |
| Report Management | ✅ | ❌ | ❌ | ❌ |
| User Management | ❌ | ❌ | ❌ | ❌ |

---

### 4. Guru Biasa
Akses terhad kepada fungsi pengajaran sahaja.

| Function | View | Create | Edit | Delete |
|---|:---:|:---:|:---:|:---:|
| Student Management | ✅ | ❌ | ❌ | ❌ |
| Attendance Management | ✅ | ✅ | ❌ | ❌ |
| Financial Management | ❌ | ❌ | ❌ | ❌ |
| Report Management | ❌ | ❌ | ❌ | ❌ |
| User Management | ❌ | ❌ | ❌ | ❌ |

---

## Guard Implementation

Permission system menggunakan `PermissionsGuard` di NestJS. Cara apply pada endpoint:

```typescript
@Get()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('Student Management', 'View')
findAll() { ... }

@Post()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('Student Management', 'Create')
create() { ... }
```

Jika user tidak mempunyai permission, API akan return:
```json
{
  "statusCode": 403,
  "message": "Anda tidak mempunyai akses: Student Management - Create"
}
```

---

## Endpoint Yang Dilindungi (Student Management)

| Method | Endpoint | Permission Diperlukan |
|---|---|---|
| GET | `/student` | Student Management - View |
| GET | `/student/:id` | Student Management - View |
| POST | `/student` | Student Management - Create |
| PATCH | `/student/:id` | Student Management - Edit |
| DELETE | `/student/:id` | Student Management - Delete |
