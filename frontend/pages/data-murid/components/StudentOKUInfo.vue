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
            <v-icon>mdi-account</v-icon> OKU Information
        </v-card-title>
        <v-divider />
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="12" md="6">
                    <v-text-field :model-value="modelValue.oku_status" :rules="[required('OKU Status')]"
                        variant="outlined" @update:model-value="update('oku_status', $event)" required>
                        <template #label>
                            OKU Status
                        </template>
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="6">
                    <v-text-field :model-value="modelValue.oku_approved_date" :rules="[required('OKU Approved Date')]"
                        variant="outlined" @update:model-value="update('oku_approved_date', $event)" required>
                        <template #label>
                            OKU Approved Date
                        </template>
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="6">
                    <v-text-field :model-value="modelValue.oku_registration_date" :rules="[required('OKU Registration Date')]"
                        variant="outlined" @update:model-value="update('oku_registration_date', $event)" required>
                        <template #label>
                            OKU Registration Date
                        </template>
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="6">
                    <v-text-field :model-value="modelValue.oku_card_date" :rules="[required('OKU Card Date')]"
                        variant="outlined" @update:model-value="update('oku_card_date', $event)" required>
                        <template #label>
                            OKU Card Date
                        </template>
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="6">
                    <v-text-field :model-value="modelValue.oku_category_type" :rules="[required('OKU Category Type')]"
                        variant="outlined" @update:model-value="update('oku_category_type', $event)" required>
                        <template #label>
                            OKU Category Type
                        </template>
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="6">
                    <v-text-field :model-value="modelValue.oku_subcategory_type" :rules="[required('OKU Subcategory Type')]"
                        variant="outlined" @update:model-value="update('oku_subcategory_type', $event)" required>
                        <template #label>
                            OKU Subcategory Type
                        </template>
                    </v-text-field>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>