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
            <v-icon>mdi-account</v-icon> Parent Information
        </v-card-title>
        <v-divider />
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="12" md="6">
                    <v-text-field :model-value="modelValue.guardian_name" :rules="[required('')]"
                        variant="outlined" @update:model-value="update('guardian_name', $event)" required>
                        <template #label>
                            Account Bank No
                        </template>
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="6">
                    <v-text-field :model-value="modelValue.account_bank_name" :rules="[required('Account Bank Name')]"
                        variant="outlined" @update:model-value="update('account_bank_name', $event)" required>
                        <template #label>
                            Account Bank Name
                        </template>
                    </v-text-field>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>