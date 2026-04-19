<script setup lang="ts">
const props = defineProps<{ modelValue: any }>()
const emit = defineEmits(['update:modelValue'])

const update = (key: string, value: any) => {
    emit('update:modelValue', { ...props.modelValue, [key]: value })
}

</script>

<template>
    <v-card class="mb-4" rounded="lg">
        <v-card-title>
            <v-icon>mdi-account</v-icon>Hostel Information
        </v-card-title>
        <v-divider />
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="12" md="6">
                    <v-text-field :model-value="modelValue.hostel_status" :rules="[required('Hostel Status')]"
                        variant="outlined" @update:model-value="update('hostel_status', $event)" required>
                        <template #label>
                            Hostel Status
                        </template>
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="6">
                    <v-text-field :model-value="modelValue.hostel_name" :rules="[required('Hostel Name')]"
                        variant="outlined" @update:model-value="update('hostel_name', $event)" required>
                        <template #label>
                            Hostel Name
                        </template>
                    </v-text-field>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>