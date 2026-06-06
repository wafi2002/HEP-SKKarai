<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

definePageMeta({
    middleware: 'auth'
})

interface UserGroup {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

const { $api } = useNuxtApp()

const userGroups = ref<UserGroup[]>([])
const loading = ref(false)
const search = ref('')
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Dialog states
const createDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)

const formLoading = ref(false)
const selectedGroup = ref<UserGroup | null>(null)

const form = ref({
    name: '',
    description: '',
})

const headers = [
    { title: 'Bil', key: 'index', sortable: false, width: '80px' },
    { title: 'Nama Kumpulan', key: 'name' },
    { title: 'Keterangan', key: 'description' },
    { title: 'Tindakan', key: 'actions', sortable: false, align: 'center' as const, width: '120px' },
]

const filteredItems = computed(() => {
    if (!search.value) return userGroups.value
    const q = search.value.toLowerCase()
    return userGroups.value.filter(g =>
        g.name.toLowerCase().includes(q) ||
        (g.description ?? '').toLowerCase().includes(q)
    )
})

async function loadUserGroups() {
    loading.value = true
    try {
        const data = await $api<UserGroup[]>('/user-group')
        userGroups.value = data
    } catch {
        showSnackbar('Gagal memuatkan data user group', 'error')
    } finally {
        loading.value = false
    }
}

function openCreateDialog() {
    form.value = { name: '', description: '' }
    createDialog.value = true
}

function openEditDialog(group: UserGroup) {
    selectedGroup.value = group
    form.value = { name: group.name, description: group.description ?? '' }
    editDialog.value = true
}

function openDeleteDialog(group: UserGroup) {
    selectedGroup.value = group
    deleteDialog.value = true
}

async function createUserGroup() {
    if (!form.value.name.trim()) return
    formLoading.value = true
    try {
        await $api('/user-group', { method: 'POST', body: form.value })
        showSnackbar('User group berjaya dicipta')
        createDialog.value = false
        await loadUserGroups()
    } catch {
        showSnackbar('Gagal mencipta user group', 'error')
    } finally {
        formLoading.value = false
    }
}

async function updateUserGroup() {
    if (!selectedGroup.value || !form.value.name.trim()) return
    formLoading.value = true
    try {
        await $api(`/user-group/${selectedGroup.value.id}`, { method: 'PATCH', body: form.value })
        showSnackbar('User group berjaya dikemaskini')
        editDialog.value = false
        await loadUserGroups()
    } catch {
        showSnackbar('Gagal mengemaskini user group', 'error')
    } finally {
        formLoading.value = false
    }
}

async function deleteUserGroup() {
    if (!selectedGroup.value) return
    formLoading.value = true
    try {
        await $api(`/user-group/${selectedGroup.value.id}`, { method: 'DELETE' })
        showSnackbar('User group berjaya dipadam')
        deleteDialog.value = false
        await loadUserGroups()
    } catch {
        showSnackbar('Gagal memadam user group', 'error')
    } finally {
        formLoading.value = false
    }
}

function showSnackbar(message: string, color = 'success') {
    snackbarMessage.value = message
    snackbarColor.value = color
    snackbar.value = true
}

onMounted(() => {
    loadUserGroups()
})
</script>

<template>
    <div>
        <v-breadcrumbs :items="['Pengurusan Pengguna', 'Kumpulan Pengguna']" />

        <div class="d-flex flex-column flex-sm-row align-sm-center justify-sm-space-between pt-8 pb-4 gap-3">
            <div class="d-flex gap-2">
                <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
                    Tambah Kumpulan
                </v-btn>
            </div>
            <div class="d-flex gap-2 w-100 w-sm-auto">
                <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" variant="outlined"
                    placeholder="Cari kumpulan..." hide-details class="flex-grow-1" style="min-width: 200px;"
                    density="comfortable" />
            </div>
        </div>

        <div class="rounded-lg shadow-lg overflow-hidden">
            <v-data-table :headers="headers" :items="filteredItems" :loading="loading"
                no-data-text="Tiada data kumpulan pengguna" loading-text="Memuatkan data..."
                items-per-page-text="Rekod per halaman" class="custom-datatable">

                <template #item.index="{ index }">
                    {{ index + 1 }}
                </template>

                <template #item.description="{ item }">
                    <span class="text-medium-emphasis">{{ item.description || '-' }}</span>
                </template>

                <template #item.actions="{ item }">
                    <div class="d-flex justify-center">
                        <v-menu location="bottom end">
                            <template #activator="{ props }">
                                <v-icon icon="mdi-dots-vertical" size="small" class="cursor-pointer"
                                    v-bind="props" @click.stop />
                            </template>
                            <v-list density="compact" min-width="160">
                                <v-list-item prepend-icon="mdi-shield-key" title="Function"
                                    :to="`/user-group/${item.id}/function`" />
                                <v-list-item prepend-icon="mdi-pencil" title="Edit" color="success"
                                    @click="openEditDialog(item)" />
                                <v-divider />
                                <v-list-item prepend-icon="mdi-delete" title="Padam" color="error" base-color="error"
                                    @click="openDeleteDialog(item)" />
                            </v-list>
                        </v-menu>
                    </div>
                </template>
            </v-data-table>
        </div>

        <!-- Create Dialog -->
        <v-dialog v-model="createDialog" max-width="500" persistent>
            <v-card rounded="lg">
                <v-card-title class="pa-4 pb-2 d-flex align-center gap-2">
                    <span>Tambah Kumpulan Pengguna</span>
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                    <v-text-field v-model="form.name" label="Nama Kumpulan" placeholder="cth: Top Management"
                        variant="outlined" density="comfortable" class="mb-3" />
                    <v-textarea v-model="form.description" label="Keterangan (pilihan)"
                        placeholder="Huraian ringkas tentang kumpulan ini" variant="outlined" density="comfortable"
                        rows="3" no-resize />
                </v-card-text>
                <v-divider />
                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-btn variant="text" color="grey" @click="createDialog = false" :disabled="formLoading">
                        Batal
                    </v-btn>
                    <v-btn color="primary" variant="flat" :loading="formLoading" :disabled="!form.name.trim()"
                        @click="createUserGroup">
                        Simpan
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Edit Dialog -->
        <v-dialog v-model="editDialog" max-width="500" persistent>
            <v-card rounded="lg">
                <v-card-title class="pa-4 pb-2 d-flex align-center gap-2">
                    <span>Kemaskini Kumpulan Pengguna</span>
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                    <v-text-field v-model="form.name" label="Nama Kumpulan" variant="outlined" density="comfortable"
                        class="mb-3" />
                    <v-textarea v-model="form.description" label="Keterangan (pilihan)" variant="outlined"
                        density="comfortable" rows="3" no-resize />
                </v-card-text>
                <v-divider />
                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-btn variant="text" color="grey" @click="editDialog = false" :disabled="formLoading">
                        Batal
                    </v-btn>
                    <v-btn color="primary" variant="flat" :loading="formLoading" :disabled="!form.name.trim()"
                        @click="updateUserGroup">
                        Kemaskini
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Dialog -->
        <v-dialog v-model="deleteDialog" max-width="420">
            <v-card rounded="lg">
                <v-card-title class="pa-4 pb-2 d-flex align-center gap-2">
                    <v-icon color="error">mdi-alert-circle</v-icon>
                    <span>Padam Kumpulan Pengguna</span>
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                    Adakah anda pasti mahu memadam kumpulan
                    <strong>{{ selectedGroup?.name }}</strong>?
                    Tindakan ini tidak boleh dibatalkan.
                </v-card-text>
                <v-divider />
                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-btn variant="text" color="grey" @click="deleteDialog = false" :disabled="formLoading">
                        Batal
                    </v-btn>
                    <v-btn color="error" variant="flat" :loading="formLoading" @click="deleteUserGroup">
                        Padam
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="bottom right">
            {{ snackbarMessage }}
            <template #actions>
                <v-btn variant="text" @click="snackbar = false">Tutup</v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<style scoped>
:deep(.v-data-table thead tr) {
    background-color: #f9fafb !important;
    border-bottom: 2px solid rgba(0, 0, 0, 0.212) !important;
}

:deep(.v-data-table thead th) {
    font-weight: 600 !important;
    padding: 16px !important;
}

:deep(.v-data-table tbody tr:nth-child(even)) {
    background-color: #f9fafb;
}

:deep(.v-data-table tbody tr:nth-child(odd)) {
    background-color: #ffffff;
}

:deep(.v-data-table tbody tr:hover) {
    background-color: #eff6ff !important;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}

:deep(.v-data-table tbody td) {
    padding: 16px !important;
}
</style>
