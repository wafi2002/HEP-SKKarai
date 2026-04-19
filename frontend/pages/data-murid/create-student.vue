<script setup lang="ts">
import { ref } from 'vue';
import { required, maxLength, isEmail } from '@/composables/useRules';

// Import form
import StudentBasicInfo from './components/StudentBasicInfo.vue';
import StudentAcademicInfo from './components/StudentAcademicInfo.vue';
import StudentHostelInfo from './components/StudentHostelInfo.vue';
import StudentOKUInfo from './components/StudentOKUInfo.vue';
import StudentFinanceInfo from './components/StudentFinanceInfo.vue';

const form = ref({
    studentID: '',
    name: '',
    ic: '',
    identity_type: 'Kad Pengenalan',
    birthdate: '',
    study_status: 'Bersekolah',
    school_enrollment_date: '',
    class_enrollment_date: '',
    className: '',
    dlp_status: '',
    class_type: '',
    stream_desc: 'Perdana/Akademik',
    field_desc: '',
    teacher_class: '',
    gender: '',
    race: '',
    religion: '',
    orphan_status: '',
    citizenship: 'Warganegara',
    origin_country: 'Malaysia',
    hostel_status: '',
    hostel_name: '',
    oku_status: '',
    oku_approved_date: '',
    oku_registration_date: '',
    oku_card_date: '',
    oku_category_type: '',
    oku_subcategory_type: '',
    account_bank_no: '',
    account_bank_name: '',
    guardian_name: '',
    guardian_identity_type: 'Kad Pengenalan',
    guardian_ic: '',
    guardian_relation: '',
    guardian_occupation: '',
    guardian_occupation_status: '',
    employer_name: '',
    income: '',
    office_phone_no: '',
    mobile_phone_no: '',
    no_of_dependents: '',

})


const valid = ref(false);

</script>

<template>
    <div>
        <v-breadcrumbs :items="['Create Student']"></v-breadcrumbs>
        <v-card rounded="lg">
            <!-- Header -->
            <v-card-title class="d-flex align-center justify-space-between pb-3">
                <div class="d-flex align-center gap-2">
                    <v-icon color="success" size="28">mdi-person</v-icon>
                    <span class="text-h6 font-weight-bold">Add New Student</span>
                </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-5">
                <v-form v-model="valid">
                    <v-container>
                        <v-row>
                            <StudentBasicInfo v-model="form" />
                            <StudentAcademicInfo v-model="form" />
                            <StudentHostelInfo v-model="form" />
                            <StudentOKUInfo v-model="form" />
                            <StudentFinanceInfo v-model="form" />

                        </v-row>
                    </v-container>
                </v-form>
            </v-card-text>
        </v-card>
    </div>
</template>