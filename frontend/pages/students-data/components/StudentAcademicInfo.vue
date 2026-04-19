<script setup lang="ts">
const props = defineProps<{ modelValue: any }>()
const emit = defineEmits(['update:modelValue'])

const update = (key: string, value: any) => {
    emit('update:modelValue', { ...props.modelValue, [key]: value })
}

</script>

<template>
    <v-row>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.study_status" :rules="[required('Study Status')]"
                @update:model-value="update('study_status', $event)" variant="outlined" required>
                <template #label>
                    Study Status <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.school_enrollment_date" :rules="[required('School Enrollment Date')]"
                @update:model-value="update('school_enrollment_date', $event)" variant="outlined" required>
                <template #label>
                    School Enrollment Date <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.class_enrollment_date" :rules="[required('Class Enrollment Date')]"
                @update:model-value="update('class_enrollment_date', $event)" variant="outlined" required>
                <template #label>
                    Class Enrollment Date <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.className" :rules="[required('Class')]" variant="outlined"
                @update:model-value="update('className', $event)" required>
                <template #label>
                    Class <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.dlp_status" :rules="[required('DLP Status')]" variant="outlined"
                @update:model-value="update('dlp_status', $event)" required>
                <template #label>
                    DLP Status <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.class_type" :rules="[required('Class Type')]" variant="outlined"
                @update:model-value="update('class_type', $event)" required>
                <template #label>
                    Class Type <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.stream_desc" :rules="[required('Stream Description')]"
                variant="outlined" @update:model-value="update('stream_desc', $event)" required>
                <template #label>
                    Stream Description <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.field_desc" :rules="[required('Field Description')]"
                variant="outlined" @update:model-value="update('field_desc', $event)" required>
                <template #label>
                    Field Description <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.teacher_class" :rules="[required('Teacher Class')]"
                variant="outlined" @update:model-value="update('field_desc', $event)" required>
                <template #label>
                    Teacher Class <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
    </v-row>
</template>