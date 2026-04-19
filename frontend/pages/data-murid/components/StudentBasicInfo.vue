<script setup lang="ts">
import { computed } from 'vue'
import { identityTypeOptions, genderOptions, raceOptions, religionOptions, citizenshipOptions } from '@/pages/data-murid/constants/studentOptions'

const props = defineProps<{ modelValue: any }>()
const emit = defineEmits(['update:modelValue'])

const update = (key: string, value: any) => {
    emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const dateMenu = ref(false)

</script>

<template>
    <v-row>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.studentID" :rules="[required('Student ID')]"
                @update:model-value="update('studentID', $event)" variant="outlined" required>
                <template #label>
                    Student ID <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.name" :rules="[required('Name')]"
                @update:model-value="update('name', $event)" variant="outlined" required>
                <template #label>
                    Name <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.ic" :rules="[required('IC')]" :maxlength="12"
                @update:model-value="update('ic', $event)" variant="outlined" required>
                <template #label>
                    IC <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-select :model-value="modelValue.identity_type" :rules="[required('Identity Type')]"
                :items="identityTypeOptions" @update:model-value="update('identity_type', $event)" variant="outlined"
                required>
                <template #label>
                    Identity Type <span style="color: red;">*</span>
                </template>
            </v-select>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-menu v-model="dateMenu" :close-on-content-click="false">
                <template #activator="{ props: menuProps }">
                    <v-text-field :model-value="modelValue.birthdate" :rules="[required('Birthdate')]"
                        v-bind="menuProps" variant="outlined" readonly append-inner-icon="mdi-calendar" required>
                        <template #label>
                            Birthdate <span style="color: red;">*</span>
                        </template>
                    </v-text-field>
                </template>
                <v-date-picker :model-value="modelValue.birthdate"
                    @update:model-value="update('birthdate', $event); dateMenu = false">
                </v-date-picker>
            </v-menu>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-select :model-value="modelValue.gender" :rules="[required('Gender')]" :items="genderOptions"
                @update:model-value="update('gender', $event)" variant="outlined" required>
                <template #label>
                    Gender <span style="color: red;">*</span>
                </template>
            </v-select>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-select :model-value="modelValue.race" :rules="[required('Race')]" :items="raceOptions"
                @update:model-value="update('race', $event)" variant="outlined" required>
                <template #label>
                    Race <span style="color: red;">*</span>
                </template>
            </v-select>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.religion" :rules="[required('Religion')]" variant="outlined"
                @update:model-value="update('religion', $event)" required>
                <template #label>
                    Religion <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6">
            <v-text-field :model-value="modelValue.citizenship" :rules="[required('Citizenship')]" variant="outlined"
                @update:model-value="update('citizenship', $event)" required>
                <template #label>
                    Citizenship <span style="color: red;">*</span>
                </template>
            </v-text-field>
        </v-col>
    </v-row>
</template>