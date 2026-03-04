<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx'
import ColorsButtons from '@/components/ui-components/button/ColorsButtons.vue';

// Go to login if dont have the session
definePageMeta({
    middleware: 'auth'
})

interface StudentAcademic {
    study_status: string;
    class: Class;
}

// TypeScript interfaces
interface Student {
    id: string;
    student_ID: string;
    name: string;
    ic: string;
    academic: StudentAcademic;
    address: Address;
    parents: Parent[];
}

interface Class {
    id: string;
    class_name: string;
    class_type: string;
    academic_year_level: string;
}

interface Address {
    address_1: string;
    address_2: string;
    address_3: string;
    postcode: string;
    city: string;
    region: string;
    state: string;
}

interface Parent {
    guardian_name: string;
    guardian_order: string;
    relation: string;
}

interface StudentTableRow {
    id: string;
    student_ID: string;
    name: string;
    ic: string;
    class_name: string;
    academic_year_level: string;
    address: string;
    guardian: string;
}

function mapStudentToTableRow(student: Student): StudentTableRow {

    // ✅ Format address
    const addressParts = [
        student.address?.address_1,
        student.address?.address_2,
        student.address?.address_3,
        student.address?.postcode,
        student.address?.city,
        student.address?.region,
        student.address?.state
    ].filter(Boolean); // Remove null/undefined values

    const formattedAddress = addressParts.length > 0
        ? addressParts.join(', ')
        : '-';

    // ✅ Get primary guardian name (or first parent if no primary)
    const primaryGuardian = student.parents?.find(p => p.guardian_order === 'primary');
    const guardianName = primaryGuardian?.guardian_name
        || student.parents?.[0]?.guardian_name
        || '-';


    return {
        id: student.id,
        student_ID: student.student_ID,
        name: student.name,
        ic: student.ic,
        class_name: student.academic?.class?.class_name ?? '-',
        academic_year_level: student.academic?.class?.academic_year_level ?? '-',
        address: formattedAddress,
        guardian: guardianName,
    };
}


interface FetchOptions {
    page: number;
    itemsPerPage: number;
    sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
}

interface FetchResult {
    items: Student[];
    total: number;
}

// Import Interface
interface ImportResult {
    success: boolean
    totalRows: number
    successCount: number
    failedCount: number
    message: string
    errors: Array<{ row: number; studentId: string; error: string }>
}

const search = ref('');
const itemsPerPage = ref(10)
const serverItems = ref<StudentTableRow[]>([]);
const loading = ref(false)
const totalItems = ref(0)
const openModal = ref(false);
const showExport = ref(false);
const filterYear = ref(null)
const yearLevelOptions = ref<{ title: string; value: string }[]>([])


const headers = [
    { title: 'Student ID', key: 'student_ID', align: 'start' },
    { title: 'Name', key: 'name', align: 'start' },
    { title: 'IC Number', key: 'ic', align: 'start' },
    { title: 'Year/Level', key: 'academic_year_level', align: 'start' },
    { title: 'Class', key: 'class_name', align: 'start' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
    // { title: 'Tarikh Lahir', key: 'birthdate', align: 'start' },
    // { title: 'Nama Bapa', key: 'father', align: 'start' },
    // { title: 'Nama Ibu', key: 'mother', align: 'start' },
    // { title: 'No. Telefon', key: 'phoneNo', align: 'start' },
    // { title: 'Alamat', key: 'address', align: 'start' },
] as const

async function loadItems(options?: FetchOptions) {
    loading.value = true;

    try {
        const page = options?.page ?? 1;
        const itemsPerPage = options?.itemsPerPage ?? 10;
        const sortBy = options?.sortBy ?? [];

        // Build query params
        const queryParams: Record<string, any> = {
            page,
            itemsPerPage,
        };

        if (sortBy.length > 0) {
            queryParams.sortBy = sortBy[0].key;
            queryParams.sortOrder = sortBy[0].order;
        }

        if (search.value) {
            queryParams.search = search.value;
        }

        if (filterYear.value) {
            queryParams.academic_year_level = filterYear.value
        }

        // ✅ Use useAPI instead of $fetch
        // useAPI automatically handles:
        // - Authorization header
        // - Token refresh if expired
        // - Error handling
        const { data, error } = await useAPI<FetchResult>('/student', {
            method: 'GET',
            query: queryParams,
        });

        if (error.value) {
            throw error.value;
        }

        if (data.value) {
            serverItems.value = data.value.items.map(mapStudentToTableRow);
            totalItems.value = data.value.total;
        }

    } catch (error) {
        console.error('Error fetching students:', error);
        // Optional: Show error notification to user
    } finally {
        loading.value = false;
    }
}

function openCreateModal() {
    //   selectedStudentId.value = null;
    //   selectedReason.value = '';
    //   noteField.value = '';
    openModal.value = true;
}

function viewStudent(student_ID: string) {
    navigateTo(`/data-murid/pelajar/${student_ID}`);
}

async function fetchYearLevels() {
    try {
        const { data, error } = await useAPI<{ id: string; class_name: string; academic_year_level: string; class_teacher_name: string }[]>('class/fetch-classes', {
            method: 'GET',
        })

        if (error.value) throw error.value

        if (data.value) {
            // Extract unique academic_year_level values
            const uniqueYears = [...new Set(data.value.map(c => c.academic_year_level))]
                .filter(Boolean)
                .sort()

            yearLevelOptions.value = uniqueYears.map(year => ({
                title: year,   // ← pakai value terus, jangan tambah 'Year'
                value: year
            }))
        }
    } catch (err) {
        console.error('Error fetching year levels:', err)
    }
}

// Call on mount
onMounted(() => {
    fetchYearLevels()
})

function onYearFilterChange() {
    loadItems()
}

// Import Student Excel File
// State
const importDialog = ref(false)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const previewData = ref([])    // all rows from excel
const previewHeaders = ref([]) // column headers
const previewError = ref('')
const isImporting = ref(false)
const importProgress = ref(0)
const importedRows = ref(0)
const importSuccess = ref(false)
const importErrors = ref<Array<{ row: number; studentId: string; error: string }>>([])

// Preview rows = first 5 only for display
const previewRows = computed(() => previewData.value.slice(0, 5))

// Methods
function openImportModal() {
    importDialog.value = true
}

function closeImportModal() {
    if (isImporting.value) return
    importDialog.value = false
    setTimeout(() => resetState(), 300)
}

function resetState() {
    selectedFile.value = null
    previewData.value = []
    previewHeaders.value = []
    previewError.value = ''
    isImporting.value = false
    importProgress.value = 0
    importedRows.value = 0
    importSuccess.value = false
    isDragging.value = false
    importErrors.value = []
}

function clearFile() {
    selectedFile.value = null
    previewData.value = []
    previewHeaders.value = []
    previewError.value = ''
    importProgress.value = 0
    importedRows.value = 0
    importSuccess.value = false
    if (fileInput.value) fileInput.value.value = ''
    importErrors.value = []
}

function triggerFileInput() {
    fileInput.value?.click()
}

function handleFileSelect(event) {
    const file = event.target.files[0]
    if (file) validateAndPreview(file)
}

function handleDrop(event) {
    isDragging.value = false
    const file = event.dataTransfer.files[0]
    if (file) validateAndPreview(file)
}

function validateAndPreview(file) {
    previewError.value = ''
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
    ]
    const allowedExtensions = ['.xlsx', '.xls']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!allowedExtensions.includes(ext)) {
        previewError.value = 'File not supported. Please upload an Excel file (.xlsx or .xls) only.'
        selectedFile.value = file // still show file info with error
        return
    }

    selectedFile.value = file
    parseExcel(file)
}

function parseExcel(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

            if (json.length === 0) {
                previewError.value = 'Excel file is empty or contains no data.'
                return
            }

            // ✅ Auto-detect header row - cari row pertama yang ada lebih dari 5 nilai tidak null
            const HEADER_ROW_INDEX = json.findIndex(
                row => row.filter(cell => cell !== null && cell !== ' ' && cell !== '').length > 5
            )

            if (HEADER_ROW_INDEX === -1) {
                previewError.value = 'Excel file format not recognized. Header not found.'
                return
            }

            previewHeaders.value = json[HEADER_ROW_INDEX].map(h => h ?? '')

            // ✅ Validate format sebelum proceed
            const validation = validateExcelFormat(previewHeaders.value)
            if (!validation.valid) {
                previewError.value = validation.message
                // Still set previewData kosong supaya button "Teruskan Import" disabled
                previewData.value = []
                return
            }

            // Data mula dari row selepas header
            previewData.value = json
                .slice(HEADER_ROW_INDEX + 1)
                .filter(row => row.some(cell => cell !== null && cell !== '' && cell !== ' '))

            if (previewData.value.length === 0) {
                previewError.value = 'No student data found in the Excel file.'
                return
            }

        } catch (err) {
            console.error('Parse error:', err)
            previewError.value = 'Failed to read the Excel file. Please ensure the file is not corrupted.'
        }
    }
    reader.readAsArrayBuffer(file)
}

// Define expected headers - ikut backend column mapping
const EXPECTED_HEADERS = [
    'BIL.', 'ID MURID', 'NAMA', 'NO. PENGENALAN', 'JENIS PENGENALAN',
    'TARIKH LAHIR', 'STATUS PENGAJIAN', 'TARIKH MASUK SEKOLAH', 'TARIKH MASUK KELAS',
    'TAHUN / TINGKATAN', 'NAMA KELAS', 'STATUS DLP', 'JENIS KELAS',
    'KETERANGAN ALIRAN', 'KETERANGAN BIDANG', 'NAMA GURU KELAS',
    'JANTINA', 'KAUM', 'AGAMA', 'WARGANEGARA', 'NEGARA ASAL',
    'STATUS ASRAMA', 'NAMA ASRAMA', 'STATUS OKU', 'TARIKH SAH OKU',
    'NO. PENDAFTARAN OKU', 'TARIKH DAFTAR OKU', 'TARIKH KAD OKU',
    'KATEGORI KETIDAKUPAYAAN', 'SUBKATEGORI KETIDAKUPAYAAN', 'STATUS YATIM',
    'NO. AKAUN BANK', 'NAMA BANK',
    'PENJAGA 1', 'NO. PENGENALAN PENJAGA 1', 'JNS. PENGENALAN PENJAGA 1',
    'HUBUNGAN PENJAGA 1', 'PEKERJAAN PENJAGA 1', 'STATUS KERJA PENJAGA 1',
    'NAMA MAJIKAN PENJAGA 1', 'PENDAPATAN PENJAGA 1',
    'NO. TEL. PEJABAT PENJAGA 1', 'NO. TEL. BIMBIT PENJAGA 1', 'TANGGUNGAN',
    'PENJAGA 2', 'NO. PENGENALAN PENJAGA 2', 'JNS. PENGENALAN PENJAGA 2',
    'HUBUNGAN PENJAGA 2', 'PEKERJAAN PENJAGA 2', 'STATUS KERJA PENJAGA 2',
    'NAMA MAJIKAN PENJAGA 2', 'PENDAPATAN PENJAGA 2',
    'NO. TEL. PEJABAT PENJAGA 2', 'NO. TEL. BIMBIT PENJAGA 2',
    'ALAMAT 1', 'ALAMAT 2', 'ALAMAT 3', 'POSKOD', 'BANDAR', 'DAERAH', 'NEGERI'
]

function validateExcelFormat(headers: string[]): { valid: boolean; message: string } {
    // Filter out empty headers
    const actualHeaders = headers.filter(h => h && h.trim() !== '')

    // Check column count
    if (actualHeaders.length !== EXPECTED_HEADERS.length) {
        return {
            valid: false,
            message: `Column count does not match. Expected ${EXPECTED_HEADERS.length} columns, but the file has ${actualHeaders.length} columns.`
        }
    }

    // Check each header matches exactly
    const mismatched: string[] = []
    EXPECTED_HEADERS.forEach((expected, index) => {
        const actual = actualHeaders[index]?.trim() ?? ''
        if (actual.toUpperCase() !== expected.toUpperCase()) {
            mismatched.push(`Columns ${index + 1}: Expected "${expected}", got "${actual}"`)
        }
    })

    if (mismatched.length > 0) {
        return {
            valid: false,
            message: `Column format is incorrect:\n${mismatched.slice(0, 3).join('\n')}${mismatched.length > 3 ? `\n...and ${mismatched.length - 3} more` : ''}`
        }
    }

    return { valid: true, message: '' }
}


async function startImport() {
    if (!selectedFile.value) return

    isImporting.value = true
    importProgress.value = 0
    importedRows.value = 0

    try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)

        // Simulate progress
        const progressInterval = setInterval(() => {
            if (importProgress.value < 90) {
                importProgress.value += 5
            }
        }, 300)

        const { data, error } = await useAPI<ImportResult>('/student/import', {
            method: 'POST',
            body: formData,
        })

        clearInterval(progressInterval)
        importProgress.value = 100
        importedRows.value = previewData.value.length

        if (error.value) {
            throw new Error(error.value?.data?.message ?? 'Import gagal')
        }

        if (data.value) {
            importProgress.value = 100
            importErrors.value = data.value.errors  // ✅ always set errors dulu

            if (data.value.successCount === 0) {
                // Semua gagal - tunjuk error tapi jangan set importSuccess
                previewError.value = `Import failed: ${data.value.failedCount} out of ${data.value.totalRows} rows could not be imported.`
            } else if (data.value.failedCount > 0) {
                // Sebahagian berjaya
                importSuccess.value = true
            } else {
                // Semua berjaya
                importSuccess.value = true
            }

            loadItems()
        }

    } catch (err) {
        previewError.value = 'Ralat semasa import: ' + err.message
    } finally {
        isImporting.value = false
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

</script>

<template>
    <div>
        <v-breadcrumbs :items="['Student Listing']"></v-breadcrumbs>
        <v-card class="mb-4" rounded="lg" elevation="1">
            <v-card-title class="pa-3 cursor-pointer d-flex align-center justify-space-between"
                @click="showExport = !showExport">
                <div class="d-flex align-center gap-2">
                    <span class="text-subtitle-1 font-weight-semibold">Export Student Listing</span>
                </div>
                <v-icon
                    :style="{ transition: 'transform 0.3s ease', transform: showExport ? 'rotate(180deg)' : 'rotate(0deg)' }">
                    mdi-chevron-down
                </v-icon>
            </v-card-title>
            <v-expand-transition>
                <div v-if="showExport">
                    <v-divider />
                    <v-card-text>
                        <ColorsButtons :filter="['Export']" />
                    </v-card-text>
                </div>
            </v-expand-transition>
        </v-card>

        <!-- Modal -->
        <v-dialog v-model="openModal" max-width="520">
            <v-card rounded="lg">
                <v-card-title class="pa-4 pb-2 d-flex align-center gap-2">
                    <span>Add New Student</span>
                </v-card-title>

                <v-divider />

                <v-card-text class="pa-4">

                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-btn variant="text" color="grey" @click="openModal = false">Cancel</v-btn>
                    <!-- <v-btn color="primary" variant="flat"
                        :disabled="!selectedStudentId || !selectedReason || (isOtherReason && !noteField)"
                        prepend-icon="mdi-plus" @click="addAbsentStudent">
                        Add
                    </v-btn> -->
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Import Student Excel modal -->
        <v-dialog v-model="importDialog" max-width="900" persistent>
            <v-card rounded="lg">
                <!-- Header -->
                <v-card-title class="d-flex align-center justify-space-between pa-5 pb-3">
                    <div class="d-flex align-center gap-2">
                        <v-icon color="success" size="28">mdi-microsoft-excel</v-icon>
                        <span class="text-h6 font-weight-bold">Import Excel</span>
                    </div>
                    <v-btn icon="mdi-close" variant="text" @click="closeImportModal" :disabled="isImporting" />
                </v-card-title>

                <v-divider />

                <v-card-text class="pa-5">
                    <!-- Step 1: Upload Zone (shown when no file selected) -->
                    <div v-if="!selectedFile">
                        <div class="upload-zone d-flex flex-column align-center justify-center pa-8 rounded-lg"
                            :class="{ 'drag-over': isDragging }" @dragover.prevent="isDragging = true"
                            @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop"
                            @click="triggerFileInput">
                            <v-icon size="64" color="success" class="mb-3">mdi-file-excel-outline</v-icon>
                            <p class="text-body-1 font-weight-medium mb-1">Drag & drop Excel file here</p>
                            <p class="text-body-2 text-medium-emphasis mb-4">or click to select a file</p>
                            <v-btn color="success" variant="outlined" prepend-icon="mdi-folder-open">
                                Choose File
                            </v-btn>
                            <p class="text-caption text-medium-emphasis mt-3">Supported formats: .xlsx, .xls only
                            </p>
                        </div>
                        <input ref="fileInput" type="file" accept=".xlsx,.xls" class="d-none"
                            @change="handleFileSelect" />
                    </div>

                    <!-- Step 2: Preview (shown after file selected) -->
                    <div v-else>
                        <!-- File Info Bar -->
                        <div class="d-flex align-center justify-space-between pa-3 mb-4 rounded-lg bg-grey-lighten-4">
                            <div class="d-flex align-center gap-2">
                                <v-icon color="success">mdi-microsoft-excel</v-icon>
                                <div>
                                    <p class="text-body-2 font-weight-medium mb-0">{{ selectedFile.name }}</p>
                                    <p class="text-caption text-medium-emphasis mb-0">{{
                                        formatFileSize(selectedFile.size) }} • {{ previewData.length }} rows</p>
                                </div>
                            </div>
                            <v-btn icon="mdi-close-circle" variant="text" color="error" size="small" @click="clearFile"
                                :disabled="isImporting" />
                        </div>

                        <!-- Error Alert -->
                        <v-alert v-if="previewError" type="error" variant="tonal" class="mb-4" :text="previewError" />

                        <!-- Preview Table -->
                        <div v-if="previewData.length > 0" class="preview-table-wrapper mb-2">
                            <p class="text-caption text-medium-emphasis mb-2">
                                <v-icon size="14">mdi-eye</v-icon>
                                Preview ({{ Math.min(5, previewData.length) }} rows out of {{
                                    previewData.length }} rows)
                            </p>
                            <v-table density="compact" class="preview-table rounded-lg" fixed-header height="220">
                                <thead>
                                    <tr>
                                        <th v-for="(header, i) in previewHeaders" :key="i"
                                            class="text-caption font-weight-bold bg-success-lighten-5">
                                            {{ header }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, rowIdx) in previewRows" :key="rowIdx">
                                        <td v-for="(cell, cellIdx) in row" :key="cellIdx" class="text-caption">
                                            {{ cell ?? '-' }}
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </div>

                        <!-- Progress Bar (shown during import) -->
                        <div v-if="isImporting" class="mt-4">
                            <div class="d-flex justify-space-between mb-1">
                                <span class="text-caption font-weight-medium">Importing data...</span>
                                <span class="text-caption text-medium-emphasis">{{ importProgress }}%</span>
                            </div>
                            <v-progress-linear v-model="importProgress" color="success" height="6" rounded striped />
                            <p class="text-caption text-medium-emphasis mt-1">
                                Processing {{ importedRows }} / {{ previewData.length }} rows
                            </p>
                        </div>

                        <!-- Success Message -->
                        <v-alert v-if="importSuccess" type="success" variant="tonal" class="mt-4"
                            text="Import berjaya! Semua data telah dimasukkan ke dalam sistem." />

                        <!-- Import Errors List -->
                        <div v-if="importErrors.length > 0" class="mt-3">
                            <p class="text-caption font-weight-medium text-error mb-2">
                                <v-icon size="14" color="error">mdi-alert-circle</v-icon>
                                {{ importErrors.length }} rows failed to import:
                            </p>
                            <div class="border rounded-lg overflow-hidden">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead style="background: #fef2f2;">
                                        <tr>
                                            <th
                                                style="padding: 8px 12px; text-align: left; font-size: 12px; border-bottom: 1px solid #fca5a5;">
                                                Row</th>
                                            <th
                                                style="padding: 8px 12px; text-align: left; font-size: 12px; border-bottom: 1px solid #fca5a5;">
                                                Student ID</th>
                                            <th
                                                style="padding: 8px 12px; text-align: left; font-size: 12px; border-bottom: 1px solid #fca5a5;">
                                                Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(err, i) in importErrors" :key="i"
                                            style="border-bottom: 1px solid rgba(0,0,0,0.06);">
                                            <td style="padding: 8px 12px; font-size: 12px;">{{ err.row }}</td>
                                            <td style="padding: 8px 12px; font-size: 12px;">{{ err.studentId }}</td>
                                            <td style="padding: 8px 12px; font-size: 12px; color: #dc2626;">{{ err.error
                                            }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </v-card-text>

                <v-divider />

                <!-- Actions -->
                <v-card-actions class="pa-4 gap-2">
                    <v-spacer />
                    <v-btn variant="outlined" color="error" @click="closeImportModal" :disabled="isImporting">
                        {{ importSuccess ? 'Close' : 'Cancel' }}
                    </v-btn>
                    <v-btn v-if="selectedFile && !importSuccess" color="success" prepend-icon="mdi-upload"
                        variant="flat" @click="startImport" :loading="isImporting"
                        :disabled="isImporting || !!previewError">
                        Continue Import
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <div class="d-flex flex-column flex-sm-row align-sm-center justify-sm-space-between pt-8 pb-4 gap-3">
            <div class="d-flex gap-2">
                <v-btn color="success" prepend-icon="mdi-microsoft-excel" @click="openImportModal">
                    Import
                </v-btn>
                <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openCreateModal">
                    Add Student
                </v-btn>
            </div>
            <div class="d-flex gap-2 w-100 w-sm-auto">
                <v-select v-model="filterYear" :items="yearLevelOptions" item-title="title" item-value="value"
                    variant="outlined" placeholder="All Years" hide-details clearable density="comfortable"
                    style="min-width: 160px; max-width: 200px;" @update:model-value="() => loadItems()" />
                <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" @input="loadItems" variant="outlined"
                    placeholder="Search" hide-details class="flex-grow-1" style="min-width: 200px;" />
            </div>
        </div>

        <div class="rounded-lg shadow-lg overflow-hidden">
            <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
                :items-length="totalItems" :loading="false" item-value="name" @update:options="loadItems"
                class="custom-datatable" show-expand>
                <template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
                    <v-btn :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                        :text="isExpanded(internalItem) ? 'Collapse' : 'More info'" class="text-none"
                        color="medium-emphasis" size="small" variant="text" width="105" border slim
                        @click="toggleExpand(internalItem)"></v-btn>
                </template>
                <template v-slot:item.actions="{ item }">
                    <div class="d-flex justify-center ga-2">
                        <v-icon icon="mdi-eye" size="small" color="info" class="cursor-pointer"
                            @click.stop="viewStudent(item.student_ID)" />
                        <v-icon icon="mdi-pencil" size="small" color="success" class="cursor-pointer"
                            @click.stop="editItem(item.student_ID)" />
                    </div>
                </template>

                <template v-slot:expanded-row="{ columns, item }">
                    <tr>
                        <td :colspan="columns.length" class="py-2">
                            <v-sheet rounded="lg" border>
                                <v-table density="compact">
                                    <tbody class="bg-surface-light">
                                        <tr>
                                            <th>Picture</th>
                                            <th>Address</th>
                                            <th>Guardian 1</th>
                                        </tr>
                                    </tbody>

                                    <tbody>
                                        <tr>
                                            <td class="py-2">
                                                <v-avatar size="100" color="grey-lighten-2">
                                                    <v-icon icon="mdi-account" size="50" color="grey"></v-icon>
                                                </v-avatar>
                                            </td>
                                            <td class="py-2"
                                                style="max-width: 200px; white-space: normal; word-wrap: break-word;">
                                                {{ item.address || '-' }}
                                            </td>
                                            <td class="py-2">{{ item.guardian || '-' }}</td>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </v-sheet>
                        </td>
                    </tr>
                </template>
            </v-data-table-server>
        </div>
    </div>
</template>

<style scoped>
/* Header background - more specific selector */
:deep(.v-data-table thead tr) {
    background-color: #f9fafb !important;
    border-bottom: 2px solid rgba(0, 0, 0, 0.212) !important;

}

:deep(.v-data-table thead th) {
    font-weight: 600 !important;
    padding: 16px !important;
}

/* Striped rows */
:deep(.v-data-table tbody tr:nth-child(even)) {
    background-color: #f9fafb;
}

:deep(.v-data-table tbody tr:nth-child(odd)) {
    background-color: #ffffff;
}

/* Hover effect */
:deep(.v-data-table tbody tr:hover) {
    background-color: #eff6ff !important;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}

/* Cell styling */
:deep(.v-data-table tbody td) {
    padding: 16px !important;
}

/* Smooth animation untuk panel */
:deep(.v-expansion-panel) {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-expansion-panel-text__wrapper) {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    will-change: height;
}

:deep(.v-expansion-panel-title) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.v-expansion-panel-title__icon) {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Smooth fade in untuk content */
.panel-content {
    animation: fadeInContent 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInContent {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Remove default Vuetify transition yang kaku */
:deep(.v-expansion-panel-text) {
    transition: none !important;
}

/* Import excel file  */
.upload-zone {
    border: 2px dashed rgba(var(--v-theme-success), 0.5);
    background: rgba(var(--v-theme-success), 0.03);
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 220px;
}

.upload-zone:hover,
.drag-over {
    border-color: rgba(var(--v-theme-success), 1);
    background: rgba(var(--v-theme-success), 0.08);
}

.preview-table-wrapper {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    overflow: hidden;
    padding: 5px;
}

/* Import excel file - preview table borders */
.preview-table-wrapper :deep(table) {
    border-collapse: collapse;
    width: 100%;
}

.preview-table-wrapper :deep(th),
.preview-table-wrapper :deep(td) {
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
    padding: 8px 12px !important;
}

.preview-table-wrapper :deep(thead th) {
    background-color: #f1f8f1 !important;
    font-weight: 600 !important;
    color: #2e7d32 !important;
}

.preview-table {
    font-size: 12px;
}
</style>