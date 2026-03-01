<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import ColorsButtons from '@/components/ui-components/button/ColorsButtons.vue';

// Go to login if dont have the session
definePageMeta({
  middleware: 'auth'
})


// ─── Types ───────────────────────────────────────────────────────────────────
interface Student {
  id: string;
  name: string;
  student_ID: string;
  class_ID: string;
}

interface ClassItem {
  id: string;
  class_name: string;
  academic_year_level: string;
  class_teacher_name: string;
}

interface AbsentRecord {
  student_ID: string;
  student_name: string;
  reason: string;
  note: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  reason: string | null;
  student: {
    id: string;
    name: string;
    student_ID: string;
  };
}

const reasonOptions = ['Sick', 'Absent Without Reason', 'Family Matter', 'Natural Disaster', 'Other'];

// ─── State ────────────────────────────────────────────────────────────────────
const selectedClassId = ref<string | null>(null);
const attendanceDate = ref<string>(new Date().toISOString().substring(0, 10));
const absentList = ref<AbsentRecord[]>([]);
const isSubmitting = ref(false);

// Load existing class
const { data: classList, error: classError } = await useAPI<ClassItem[]>('/class/fetch-classes');

// Load student attendance based on selected class
const { data: existingAttendance, execute: fetchAttendance } = await useAPI<AttendanceRecord[]>(
  () => `/attendance/fetch-absents/${selectedClassId.value}`,
  {
    watch: false,
    server: false,
    immediate: false,
  }
);

// Load student data based on selected class
const { data: allStudents, execute: fetchStudents } = await useAPI<Student[]>(
  () => `/student/fetch-students/${selectedClassId.value}`,
  {
    watch: false,  // disable auto watch dulu
    server: false,
    immediate: false
  }
)

// ─── Watch: bila kelas bertukar, fetch students + existing attendance ─────────
watch(selectedClassId, async (newVal) => {
  absentList.value = [];
  if (newVal) {
    await Promise.all([fetchStudents(), fetchAttendance()]);
    populateAbsentListFromExisting();
  }
});

// Watch: bila tarikh bertukar, repopulate absent list dari existing attendance
watch(attendanceDate, () => {
  if (selectedClassId.value) {
    populateAbsentListFromExisting();
  }
});

// ─── Populate absent list dari existing attendance (untuk tarikh yang dipilih) ─
function populateAbsentListFromExisting() {
  if (!existingAttendance.value) return;

  // Filter rekod yang match tarikh yang dipilih dan bukan 'present'
  const absentForDate = existingAttendance.value.filter(
    (record) =>
      record.date.substring(0, 10) === attendanceDate.value &&
      record.status !== 'present'
  );

  absentList.value = absentForDate.map((record) => ({
    student_ID: record.student.student_ID,
    student_name: record.student.name,
    reason: mapStatusToReason(record.status, record.reason),
    note: record.reason ?? '',
  }));
}

function mapStatusToReason(status: string, reason: string | null): string {
  const map: Record<string, string> = {
    sick: 'Sick',
    absent: 'Absent Without Reason',
    excused: 'Family Matter',
    uncertain: 'Other',
    late: 'Other',
    leave: 'Other',
  };
  return map[status] ?? reason ?? 'Other';
}

// Modal state
const showAddModal = ref(false);
const showConfirmDialog = ref(false);
const snackbar = ref({ show: false, text: '', color: 'success' });

// Form dalam modal
const selectedStudentId = ref<string | null>(null);
const selectedReason = ref<string>('');
const noteField = ref<string>('');
const formRef = ref();
const formValid = ref(false);
const isOtherReason = computed(() => selectedReason.value === 'Other');

const dateMenu = ref(false);
const attendanceDatePicker = ref<Date>(new Date());
const showExport = ref(false);

function onDateSelected(date: Date) {
  // guna local date instead of UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  attendanceDate.value = `${year}-${month}-${day}`;
  dateMenu.value = false;
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const selectedClass = computed(() =>
  classList.value?.find(c => c.id === selectedClassId.value) ?? null
);

const studentsInClass = computed(() => allStudents.value ?? []);

// Murid yang belum ditanda absent (untuk dropdown pilihan)
const availableStudents = computed(() => {
  const result = studentsInClass.value?.filter(
    s => !absentList.value.some(a => a.student_ID === s.student_ID)
  );
  console.log('availableStudents sample:', result?.[0]); // tengok structure
  return result;
});

// Auto-fill details bila student dipilih
const selectedStudentDetail = computed(() =>
  allStudents.value?.find(s => s.student_ID === selectedStudentId.value) ?? null
);

const attendanceStats = computed(() => {
  const total = studentsInClass.value?.length ?? 0;
  const absent = absentList.value.length;
  const present = total - absent;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, absent, present, percent };
});

// ─── Table Headers ────────────────────────────────────────────────────────────
const tableHeaders = [
  { title: 'No.', key: 'index', width: '60px', sortable: false },
  { title: 'Student Name', key: 'student_name' },
  { title: 'Student ID', key: 'student_ID' },
  { title: 'Reason for Absence', key: 'reason' },
  { title: 'Notes', key: 'note' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
];

// ─── Methods ──────────────────────────────────────────────────────────────────
function openAddModal() {
  selectedStudentId.value = null;
  selectedReason.value = '';
  noteField.value = '';
  showAddModal.value = true;
}

function addAbsentStudent() {
  if (!selectedStudentDetail.value || !selectedReason.value) return;
  absentList.value.push({
    student_ID: selectedStudentDetail.value.student_ID,
    student_name: selectedStudentDetail.value.name,
    reason: selectedReason.value,
    note: noteField.value,
  });
  showAddModal.value = false;
}

function removeAbsent(studentID: string) {
  absentList.value = absentList.value.filter((a) => a.student_ID !== studentID);
}


// ─── Submit Attendance ────────────────────────────────────────────────────────
async function submitAttendance() {
  showConfirmDialog.value = false;
  isSubmitting.value = true;

  try {
    const payload = {
      class_ID: selectedClassId.value,
      date: attendanceDate.value,
      absent_students: absentList.value,
    };

    await useAPI('/attendance', {
      method: 'POST',
      body: payload,
    });

    snackbar.value = {
      show: true,
      text: `Attendance recorded successfully! ${attendanceStats.value.present} students present, ${attendanceStats.value.absent} absent.`,
      color: 'success',
    };

    absentList.value = [];
    selectedClassId.value = null;
  } catch (error) {
    snackbar.value = {
      show: true,
      text: 'An error occurred while saving the record. Please try again.',
      color: 'error',
    };
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div>
    <v-breadcrumbs :items="['Student absence']" />

    <v-card class="mb-4" rounded="lg" elevation="1">
      <v-card-title class="pa-3 cursor-pointer d-flex align-center justify-space-between"
        @click="showExport = !showExport">
        <div class="d-flex align-center gap-2">
          <span class="text-subtitle-1 font-weight-semibold">Export Student Attendance</span>
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

    <!-- ── Step 1: Pilih Kelas & Tarikh ────────────────────────────────── -->
    <v-card class="mt-4" rounded="lg" elevation="1">
      <v-card-title class="pa-4 pb-0">
        <div class="d-flex align-center gap-2">
          <span class="text-subtitle-1 font-weight-semibold">Session Information</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-select v-model="selectedClassId" :items="classList ?? []"
              :item-title="item => `${item.academic_year_level.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())} ${item.class_name}`"
              item-value="id" label="Class" prepend-inner-icon="mdi-google-classroom" variant="outlined"
              density="comfortable" clearables hide-details>

              <template #item="{ props, item }">
                <v-list-item v-bind="props" />
              </template>

              <template #selection="{ item }">
                <span>{{item.raw.academic_year_level.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}} {{
                  item.raw.class_name }}
                </span>
              </template>

            </v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-menu v-model="dateMenu" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-text-field v-bind="props" :model-value="attendanceDate" label="Date"
                  prepend-inner-icon="mdi-calendar" variant="outlined" density="comfortable" hide-details readonly />
              </template>
              <v-date-picker v-model="attendanceDatePicker" @update:model-value="onDateSelected" />
            </v-menu>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ── Stats Bar (muncul selepas kelas dipilih) ─────────────────────── -->
    <v-expand-transition>
      <div v-if="selectedClassId" class="mt-4 mb-4">
        <v-row dense>
          <v-col cols="4">
            <v-card rounded="lg" color="blue-lighten-5" flat>
              <v-card-text class="pa-3 text-center">
                <div class="text-h5 font-weight-bold text-blue-darken-2">{{ attendanceStats.total }}</div>
                <div class="text-caption text-blue-darken-1">Total Students</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card rounded="lg" color="green-lighten-5" flat>
              <v-card-text class="pa-3 text-center">
                <div class="text-h5 font-weight-bold text-green-darken-2">{{ attendanceStats.present }}</div>
                <div class="text-caption text-green-darken-1">Present</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card rounded="lg" color="red-lighten-5" flat>
              <v-card-text class="pa-3 text-center">
                <div class="text-h5 font-weight-bold text-red-darken-2">{{ attendanceStats.absent }}</div>
                <div class="text-caption text-red-darken-1">Absent</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Attendance progress bar -->
        <v-card rounded="lg" flat class="mt-2 pa-3" color="grey-lighten-4">
          <div class="d-flex justify-space-between mb-1">
            <span class="text-caption text-medium-emphasis">Attendance Rate</span>
            <span class="text-caption font-weight-bold">{{ attendanceStats.percent }}%</span>
          </div>
          <v-progress-linear :model-value="attendanceStats.percent"
            :color="attendanceStats.percent >= 80 ? 'success' : attendanceStats.percent >= 60 ? 'warning' : 'error'"
            rounded height="8" bg-color="grey-lighten-2" />
        </v-card>
      </div>
    </v-expand-transition>

    <!-- ── Step 2: Senarai Tidak Hadir ─────────────────────────────────── -->
    <v-expand-transition>
      <v-card v-if="selectedClassId" class="mb-4" rounded="lg" elevation="1">
        <v-card-title class="pa-4 pb-0">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2">
              <span class="text-subtitle-1 font-weight-semibold">Absent Students List</span>
              <v-chip v-if="absentList.length" color="error" size="small" density="comfortable">
                {{ absentList.length }}
              </v-chip>
            </div>
            <v-btn color="primary" variant="flat" flex-grow-1 :disabled="availableStudents?.length === 0"
              prepend-icon="mdi-plus" @click="openAddModal">
              Add
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="pa-0">
          <!-- Empty state -->
          <div v-if="absentList.length === 0" class="py-10 text-center">
            <v-icon size="56" color="success" class="mb-3">mdi-check-circle-outline</v-icon>
            <p class="text-body-1 font-weight-medium text-success">All students are present!</p>
            <p class="text-body-2 text-medium-emphasis">
              Click "+ Add" if any student is absent.
            </p>
          </div>

          <!-- Data table -->
          <v-data-table v-else :headers="tableHeaders" :items="absentList" :items-per-page="10" item-value="student_ID"
            density="comfortable" hover>
            <!-- Row number -->
            <template #[`item.index`]="{ index }">
              <span class="text-medium-emphasis text-caption">{{ index + 1 }}</span>
            </template>

            <!-- Student name -->
            <template #[`item.student_name`]="{ item }">
              <div class="d-flex align-center gap-2 py-1">
                <span class="text-body-2 font-weight-medium">{{ item.student_name }}</span>
              </div>
            </template>

            <!-- Reason -->
            <template #[`item.reason`]="{ item }">
              <v-chip
                :color="item.reason === 'Sick' ? 'orange' : item.reason === 'Absent Without Reason' ? 'red' : 'blue'"
                size="small" variant="tonal">
                {{ item.reason }}
              </v-chip>
            </template>

            <!-- Notes -->
            <template #[`item.note`]="{ item }">
              <span class="text-body-2 text-medium-emphasis">
                {{ item.note || '—' }}
              </span>
            </template>

            <!-- Actions -->
            <template #[`item.actions`]="{ item }">
              <v-btn icon="mdi-delete-outline" color="error" variant="text" size="small"
                @click="removeAbsent(item.student_ID)" />
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- ── Submit Button ────────────────────────────────────────────────── -->
    <v-expand-transition>
      <div v-if="selectedClassId" class="mx-4 mb-6 d-flex justify-end gap-2">
        <v-btn variant="outlined" color="grey" @click="absentList = []; selectedClassId = null">
          Cancel
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save-outline" :disabled="!selectedClassId"
          @click="showConfirmDialog = true">
          Save Record
        </v-btn>
      </div>
    </v-expand-transition>

    <!-- ── Modal: Tambah Murid Tidak Hadir ──────────────────────────────── -->
    <v-dialog v-model="showAddModal" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2 d-flex align-center gap-2">
          <span>{{selectedClass?.academic_year_level.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}} {{
            selectedClass?.class_name }}</span>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-form ref="formRef" v-model="formValid">

            <!-- Student Name -->
            <v-autocomplete v-model="selectedStudentId" :items="availableStudents" item-title="name"
              item-value="student_ID" prepend-inner-icon="mdi-account" variant="outlined" density="comfortable"
              :rules="[v => !!v || 'Please select a student']" class="mb-3" no-data-text="No students found" clearable>
              <template #label>
                Student Name <span style="color: red;">*</span>
              </template>
            </v-autocomplete>

            <!-- Student ID (auto-fill) -->
            <v-text-field :model-value="selectedStudentDetail?.student_ID ?? undefined" label="Student ID"
              prepend-inner-icon="mdi-card-account-details-outline" variant="outlined" density="comfortable" readonly
              class="mb-8 grey-field" hide-details />

            <!-- Reason for Absence -->
            <v-select v-model="selectedReason" :items="reasonOptions" label="Reason for Absence *"
              prepend-inner-icon="mdi-comment-question-outline" variant="outlined" density="comfortable"
              :rules="[v => !!v || 'Please select a reason']" class="mb-3" />

            <!-- Additional Notes -->
            <v-textarea v-model="noteField" prepend-inner-icon="mdi-note-text-outline" variant="outlined"
              density="comfortable" rows="2" auto-grow
              :rules="[v => !isOtherReason || !!v || 'Please provide notes for Other reason']">
              <template #label>
                Notes <span v-if="isOtherReason" style="color: red;">*</span>
                <span v-else> (Optional)</span>
              </template>
            </v-textarea>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" color="grey" @click="showAddModal = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat"
            :disabled="!selectedStudentId || !selectedReason || (isOtherReason && !noteField)" prepend-icon="mdi-plus"
            @click="addAbsentStudent">
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Confirm Dialog ────────────────────────────────────────────────── -->
    <v-dialog v-model="showConfirmDialog" max-width="420">
      <v-card rounded="lg">
        <v-card-text class="pa-5 text-center">
          <v-icon size="56" color="primary" class="mb-3">mdi-clipboard-check</v-icon>
          <h3 class="text-h6 mb-2">Confirm Attendance Record</h3>
          <p class="text-body-2 text-medium-emphasis mb-1">
            <strong>{{selectedClass?.academic_year_level.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}} {{
              selectedClass?.class_name }}</strong> — {{ attendanceDate }}
          </p>
          <p class="text-body-2 text-medium-emphasis">
            {{ attendanceStats.present }} students present,
            <span class="text-error font-weight-medium">{{ attendanceStats.absent }} absent</span>
          </p>
        </v-card-text>
        <v-card-actions class="pb-4 px-4 d-flex gap-2">
          <v-btn variant="outlined" color="grey" flex-grow-1 @click="showConfirmDialog = false">
            Review Again
          </v-btn>
          <v-btn color="primary" variant="flat" flex-grow-1 :loading="isSubmitting" :disabled="isSubmitting"
            @click="submitAttendance">
            Yes, Save Record
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Snackbar ──────────────────────────────────────────────────────── -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" :timeout="4000" rounded="lg">
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.grey-field :deep(.v-field) {
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>