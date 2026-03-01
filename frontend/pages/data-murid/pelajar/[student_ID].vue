<script setup lang="ts">
import { computed, ref } from 'vue';

// Go to login if dont have the session
definePageMeta({
  middleware: 'auth'
})

const route = useRoute();

const student_ID = computed(() => route.params.student_ID as string);

interface StudentAcademic {
    study_status: string;
    class_enrollment_date: Date;
    school_enrollment_date: Date;
    dlp_status: string;
    field_desc: string;
    stream_desc: string;
    class: Class;
}

// TypeScript interfaces
interface Student {
    id: string;
    student_ID: string;
    name: string;
    ic: string;
    identity_type: string;
    birthdate: Date;
    gender: string;
    race: string;
    religion: string;
    citizenship: string;
    origin_country: string;
    orphan_status: string;
    account_bank_name: string;
    account_bank_no: string;
    academic: StudentAcademic;
    address: Address;
    parents: Parent[];
}

interface Class {
    id: string;
    class_name: string;
    class_type: string;
    class_teacher_name: string;
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
    employer_name: string;
    ic: string;
    identity_type: string;
    income: string;
    mobile_phone_no: string;
    no_of_dependents: number;
    occupation: string;
    occupation_status: string;
    office_phone_no: string;
    relation: string;
}

const student = ref<Student | null>(null); // ✅ Tukar dari array ke single object
const loading = ref(false); // ✅ Tambah loading state

async function loadStudentDetails() {
    loading.value = true;
    try {
        // ✅ Fix: query params kena dalam object format
        const { data, error } = await useAPI<Student>(`/student/${student_ID.value}`, {
            method: 'GET',
        });

        if (error.value) {
            throw error.value;
        }

        console.log(data.value);

        if (data.value) {
            student.value = data.value; // ✅ Single object, bukan array
        }

    } catch (error) {
        console.error('Error fetching students:', error);
    } finally {
        loading.value = false; // ✅ Set loading to false
    }
}

onMounted(() => {
    loadStudentDetails();
});

const tab = ref('one')

</script>

<template>
    <div class="mx-2">
        <!-- Tabs dengan elevation -->
        <v-sheet elevation="4" rounded="lg" class="pa-2">
            <v-tabs color="primary" v-model="tab">
                <v-tab value="profile">Profile</v-tab>
                <v-tab value="academic">Academic</v-tab>
                <v-tab value="finance">Finance</v-tab>
                <v-tab value="jqaf">JQAF</v-tab>
                <v-tab value="pbd">PBD</v-tab>
            </v-tabs>
        </v-sheet>

        <v-divider class="mb-3"></v-divider>

        <div>
            <!-- Profile -->
            <v-row v-if="student && tab === 'profile'" class="mb-3">
                <v-col cols="12" md="6">
                    <v-card class="pa-5 mb-3" elevation="4" rounded="lg">
                        <v-card-title class="text-h4 px-0">Student Profile</v-card-title>
                        <v-divider :thickness="1" class="border-opacity-100 my-3" color="success"></v-divider>
                        <v-row v-if="student" class="mb-3">
                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Name</div>
                                <div class="font-light text-black">{{ student.name }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Student ID</div>
                                <div class="font-light text-black">{{ student.student_ID }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Identity Card Number</div>
                                <div class="font-light text-black">{{ student.ic }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Identification Type</div>
                                <div class="font-light text-black">{{ student.identity_type }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Date of Birth</div>
                                <div class="font-light text-black">
                                    {{ new Date(student.birthdate).toLocaleDateString('en-GB', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    }) }}
                                </div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Gender</div>
                                <div class="font-light text-black">{{ student.gender }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Race</div>
                                <div class="font-light text-black">{{ student.race }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Religion</div>
                                <div class="font-light text-black">{{ student.religion }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Citizenship</div>
                                <div class="font-light text-black">{{ student.citizenship }}</div>
                            </v-col>
                        </v-row>

                        <div v-else>
                            <p>No student data available</p>
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" md="6">
                    <v-card v-if="tab === 'profile'" class="pa-5 mb-3" elevation="4" rounded="lg">
                        <v-card-title class="text-h4 px-0">Address</v-card-title>
                        <v-divider :thickness="1" class="border-opacity-100 my-3" color="success"></v-divider>

                        <v-row v-if="student" class="mb-3">
                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Address Line 1</div>
                                <div class="font-light text-black">{{ student.address.address_1 }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Address Line 2</div>
                                <div class="font-light text-black">{{ student.address.address_2 || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Address Line 3</div>
                                <div class="font-light text-black">{{ student.address.address_3 || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Postcode</div>
                                <div class="font-light text-black">{{ student.address.postcode || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">City</div>
                                <div class="font-light text-black">{{ student.address.city || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">State</div>
                                <div class="font-light text-black">{{ student.address.state || '-' }}</div>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>

                <v-col cols="12" md="12">
                    <v-card v-if="tab === 'profile'" class="pa-5 mb-3" elevation="4" rounded="lg">
                        <v-card-title class="text-h4 px-0">Guardian 1</v-card-title>
                        <v-divider :thickness="1" class="border-opacity-100 my-3" color="success"></v-divider>

                        <v-row v-if="student" class="mb-3">
                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Guardian Name</div>
                                <div class="font-light text-black">{{ student.parents[0].guardian_name || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Relation</div>
                                <div class="font-light text-black">{{ student.parents[0].relation || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Identity Card Number</div>
                                <div class="font-light text-black">{{ student.parents[0].ic || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Identification Type</div>
                                <div class="font-light text-black">{{ student.parents[0].identity_type || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Mobile Phone Number</div>
                                <div class="font-light text-black">{{ student.parents[0].mobile_phone_no || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Number of Dependents</div>
                                <div class="font-light text-black">{{ student.parents[0].no_of_dependents || '-' }}
                                </div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Occupation Status</div>
                                <div class="font-light text-black">{{ student.parents[0].occupation_status || '-' }}
                                </div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Employer Name</div>
                                <div class="font-light text-black">{{ student.parents[0].employer_name || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Income</div>
                                <div class="font-light text-black">{{ student.parents[0].income || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Office Phone Number</div>
                                <div class="font-light text-black">{{ student.parents[0].office_phone_no || '-' }}</div>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>

                <v-col cols="12" md="12">
                    <v-card v-if="tab === 'profile'" class="pa-5 mb-3" elevation="4" rounded="lg">
                        <v-card-title class="text-h4 px-0">Guardian 2</v-card-title>
                        <v-divider :thickness="1" class="border-opacity-100 my-3" color="success"></v-divider>

                        <v-row v-if="student" class="mb-3">
                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Guardian Name</div>
                                <div class="font-light text-black">{{ student.parents[1].guardian_name || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Relation</div>
                                <div class="font-light text-black">{{ student.parents[1].relation || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Identity Card Number</div>
                                <div class="font-light text-black">{{ student.parents[1].ic || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Identification Type</div>
                                <div class="font-light text-black">{{ student.parents[1].identity_type || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Mobile Phone Number</div>
                                <div class="font-light text-black">{{ student.parents[1].mobile_phone_no || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Number of Dependents</div>
                                <div class="font-light text-black">{{ student.parents[1].no_of_dependents || '-' }}
                                </div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Occupation Status</div>
                                <div class="font-light text-black">{{ student.parents[1].occupation_status || '-' }}
                                </div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Employer Name</div>
                                <div class="font-light text-black">{{ student.parents[1].employer_name || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Income</div>
                                <div class="font-light text-black">{{ student.parents[1].income || '-' }}</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Office Phone Number</div>
                                <div class="font-light text-black">{{ student.parents[1].office_phone_no || '-' }}</div>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>

                <v-col cols="12" md="12">
                    <v-card v-if="tab === 'profile'" class="pa-5 mb-3" elevation="4" rounded="lg">
                        <v-card-title class="text-h4 px-0">Orphan Status</v-card-title>
                        <v-divider :thickness="1" class="border-opacity-100 my-3" color="success"></v-divider>

                        <v-row v-if="student" class="mb-3">
                            <v-col cols="12" md="6">
                                <div class="text-subtitle-3 font-light mb-1 text-gray-500">Status</div>
                                <div class="font-light text-black">{{ student.orphan_status || '-' }}</div>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>

            </v-row>

            <!-- Academic -->
            <v-card v-if="student && tab === 'academic'" class="pa-5 mb-3" elevation="4" rounded="lg">
                <v-card-title class="text-h4 px-0">Student Academic</v-card-title>
                <v-divider :thickness="1" class="border-opacity-100 my-3" color="success"></v-divider>
                <v-row v-if="student" class="mb-3">
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">Status</div>
                        <div class="font-light text-black">{{ student.academic.study_status }}</div>
                    </v-col>
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">School Enrollment Date</div>
                        <div class="font-light text-black">{{ new
                            Date(student.academic.school_enrollment_date).toLocaleDateString('en-GB', {
                                day:
                                    '2-digit', month: 'short', year: 'numeric'
                            }) }}
                        </div>
                    </v-col>
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">DLP Status</div>
                        <div class="font-light text-black">{{ student.academic.dlp_status || '-' }}</div>
                    </v-col>
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">Field Description</div>
                        <div class="font-light text-black">{{ student.academic.field_desc || '-' }}</div>
                    </v-col>
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">Stream Description</div>
                        <div class="font-light text-black">{{ student.academic.stream_desc || '-' }}</div>
                    </v-col>
                </v-row>
            </v-card>
            <v-card v-if="student && tab === 'academic'" class="pa-5 mb-3" elevation="4" rounded="lg">
                <v-card-title class="text-h4 px-0">Class Information</v-card-title>
                <v-divider :thickness="1" class="border-opacity-100 my-3" color="success"></v-divider>

                <v-row v-if="student" class="mb-3">
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">Class</div>
                        <div class="font-light text-black">
                            {{ student.academic.class.class_name }}
                        </div>
                    </v-col>

                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">Class Enrollment Date</div>
                        <div class="font-light text-black">
                            {{ new Date(student.academic.class_enrollment_date).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric'
                            }) }}
                        </div>
                    </v-col>

                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">Year / Form</div>
                        <div class="font-light text-black">
                            {{ student.academic.class.academic_year_level }}
                        </div>
                    </v-col>

                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">Class Teacher</div>
                        <div class="font-light text-black">
                            {{ student.academic.class.class_teacher_name }}
                        </div>
                    </v-col>
                </v-row>

                <div v-else>
                    <p>No student data available</p>
                </div>
            </v-card>

            <!-- Finance -->
            <v-card v-if="student && tab === 'finance'" class="pa-5 mb-3" color="brown" elevation="4" rounded="lg">
                <v-card-title class="text-h4 px-0">Finance</v-card-title>
                <v-divider :thickness="1" class="border-opacity-100 my-3" color="success"></v-divider>
                <v-row v-if="student" class="mb-3">
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">Account Bank Name</div>
                        <div class="font-light text-black">{{ student.account_bank_name || '-' }}</div>
                    </v-col>
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">Account Bank Number</div>
                        <div class="font-light text-black">{{ student.account_bank_no || '-' }}</div>
                    </v-col>
                </v-row>
            </v-card>

            <!-- JQAF -->
            <v-card v-if="student && tab === 'jqaf'" class="pa-5 mb-3" color="brown" elevation="4" rounded="lg">
                <v-card-title class="text-h4 px-0">JQAF</v-card-title>
                <v-divider :thickness="1" class="border-opacity-100 my-3" color="success"></v-divider>
                <v-row v-if="student" class="mb-3">
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">JQAF</div>
                        <div class="font-light text-black">{{ student.account_bank_name || '-' }}</div>
                    </v-col>
                </v-row>
            </v-card>

            <!-- PBD -->
            <v-card v-if="student && tab === 'pbd'" class="pa-5 mb-3" color="brown" elevation="4" rounded="lg">
                <v-card-title class="text-h4 px-0">PBD</v-card-title>
                <v-divider :thickness="1" class="border-opacity-100 my-3" color="success"></v-divider>
                <v-row v-if="student" class="mb-3">
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-3 font-light mb-1 text-gray-500">PBD</div>
                        <div class="font-light text-black">{{ student.account_bank_name || '-' }}</div>
                    </v-col>
                </v-row>
            </v-card>
        </div>
    </div>

</template>