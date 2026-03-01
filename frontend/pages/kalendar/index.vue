<script setup lang="ts">
import { ref, computed } from 'vue'

// Go to login if dont have the session
definePageMeta({
  middleware: 'auth'
})

const teachers = ref([
  {
    id: 1,
    name: 'Cikgu A',
    color: 'primary'
  },
  {
    id: 2,
    name: 'Cikgu B',
    color: 'success'
  },
  {
    id: 3,
    name: 'Cikgu C',
    color: 'warning'
  }
])

const events = ref([
  {
    name: 'Cikgu A - Matematik Tingkatan 4A',
    start: '2026-01-27 10:00',
    end: '2026-01-27 10:40',
    color: 'primary',
    teacherId: 1,
    subject: 'Matematik',
    class: '4A'
  },
  {
    name: 'Cikgu B - Bahasa Inggeris 5B',
    start: '2026-01-27 10:40',
    end: '2026-01-27 11:20',
    color: 'success',
    teacherId: 2,
    subject: 'Bahasa Inggeris',
    class: '5B'
  },
  {
    name: 'Cikgu A - Matematik Tingkatan 4B',
    start: '2026-01-27 11:20',
    end: '2026-01-27 12:00',
    color: 'primary',
    teacherId: 1,
    subject: 'Matematik',
    class: '4B'
  },
  {
    name: 'Cikgu C - Sains 3A',
    start: '2026-01-27 08:00',
    end: '2026-01-27 08:40',
    color: 'warning',
    teacherId: 3,
    subject: 'Sains',
    class: '3A'
  },
  {
    name: 'Cikgu A - Matematik 4A',
    start: '2026-01-28 10:00',
    end: '2026-01-28 10:40',
    color: 'primary',
    teacherId: 1,
    subject: 'Matematik',
    class: '4A'
  },
  {
    name: 'Cikgu B - BI 5B',
    start: '2026-01-28 11:20',
    end: '2026-01-28 12:00',
    color: 'success',
    teacherId: 2,
    subject: 'Bahasa Inggeris',
    class: '5B'
  }
])

const selectedTeachers = ref([1, 2, 3])

const filteredEvents = computed(() => {
  return events.value.filter(event =>
    selectedTeachers.value.includes(event.teacherId)
  )
})

// Time slots untuk horizontal layout
const timeSlots = [
  '07:00', '07:40', '08:00', '08:40', '09:20', '10:00',
  '10:40', '11:20', '12:00', '12:40', '13:20', '14:00',
  '14:40', '15:20', '16:00'
]

// Days untuk horizontal layout
const weekDays = computed(() => {
  const days = []
  const startDate = new Date('2026-01-26') // Isnin minggu ni

  for (let i = 0; i < 5; i++) { // Isnin - Jumaat
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'short' })
    })
  }

  return days
})

// Get events untuk specific day & time (horizontal layout)
const getEventForSlot = (date: string, time: string) => {
  const slotStart = `${date} ${time}`

  return filteredEvents.value.find(event => {
    return event.start === slotStart
  })
}
</script>

<template>
  <div>
    <v-breadcrumbs :items="['Kalendar']"></v-breadcrumbs>
  </div>

  <!-- Controls -->
  <v-card class="mx-4 mb-4">
    <v-card-text>
      <div class="d-flex align-center justify-space-between flex-wrap gap-4">
        <!-- Teacher Filter -->
        <v-chip-group v-model="selectedTeachers" multiple>
          <v-chip v-for="teacher in teachers" :key="teacher.id" :value="teacher.id" :color="teacher.color" filter
            variant="outlined">
            {{ teacher.name }}
          </v-chip>
        </v-chip-group>
      </div>
    </v-card-text>
  </v-card>

  <!-- Horizontal Layout -->
  <v-card class="mx-4">
    <v-card-text class="pa-0">
      <div class="horizontal-calendar">
        <!-- Header Row (Masa) -->
        <div class="calendar-grid">
          <div class="time-header corner-cell">Tarikh / Masa</div>
          <div v-for="time in timeSlots" :key="time" class="time-header">
            {{ time }}
          </div>
        </div>

        <!-- Day Rows -->
        <div v-for="day in weekDays" :key="day.date" class="calendar-grid">
          <!-- Day Label -->
          <div class="day-label">
            {{ day.label }}
          </div>

          <!-- Time Slots -->
          <div v-for="time in timeSlots" :key="`${day.date}-${time}`" class="time-slot">
            <div v-if="getEventForSlot(day.date, time)"
              :class="`event-card bg-${getEventForSlot(day.date, time).color}`">
              <div class="text-caption font-weight-bold text-white">
                {{ getEventForSlot(day.date, time).subject }}
              </div>
              <div class="text-caption text-white">
                {{ getEventForSlot(day.date, time).class }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
/* Horizontal Calendar Styles */
.horizontal-calendar {
  overflow-x: auto;
  min-width: 100%;
}

.calendar-grid {
  display: grid;
  grid-template-columns: 150px repeat(15, 100px);
  border-bottom: 1px solid #e0e0e0;
}

.corner-cell {
  background-color: #f5f5f5;
  font-weight: 600;
  border-right: 2px solid #e0e0e0;
}

.time-header {
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  border-bottom: 2px solid #e0e0e0;
}

.day-label {
  padding: 12px;
  font-weight: 600;
  background-color: #fafafa;
  border-right: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.time-slot {
  padding: 4px;
  border-right: 1px solid #e0e0e0;
  min-height: 60px;
  position: relative;
}

.event-card {
  padding: 8px 6px;
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>