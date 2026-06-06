<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
    middleware: 'auth'
})

interface Permission {
    id: string;
    label: string;
    active: boolean;
}

interface SystemFunction {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
}

interface UserGroup {
    id: string;
    name: string;
}

const route = useRoute()
const { $api } = useNuxtApp()
const groupId = route.params.id as string

const userGroup = ref<UserGroup | null>(null)
const functions = ref<SystemFunction[]>([])
const loading = ref(false)
const savingId = ref<string | null>(null)
const openPanels = ref<string[]>([])
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const createDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)
const selectedFunc = ref<SystemFunction | null>(null)
const formLoading = ref(false)
const form = ref({ name: '', description: '' })

// Add permission
const addPermDialog = ref(false)
const addPermFuncId = ref<string | null>(null)
const addPermName = ref('')
const addPermLoading = ref(false)

async function loadData() {
    loading.value = true
    try {
        const [groupData, funcData] = await Promise.all([
            $api<UserGroup>(`/user-group/${groupId}`),
            $api<SystemFunction[]>(`/user-group/${groupId}/functions`),
        ])
        userGroup.value = groupData
        functions.value = funcData
    } catch {
        showSnackbar('Gagal memuatkan data', 'error')
    } finally {
        loading.value = false
    }
}

function getActiveCount(func: SystemFunction) {
    return func.permissions.filter(p => p.active).length
}

async function savePermissions(func: SystemFunction) {
    savingId.value = func.id
    try {
        const activeIds = func.permissions.filter(p => p.active).map(p => p.id)
        await $api(`/user-group/${groupId}/permissions`, {
            method: 'POST',
            body: { permissionIds: activeIds },
        })
        showSnackbar('Permission berjaya disimpan')
    } catch {
        showSnackbar('Gagal menyimpan permission', 'error')
    } finally {
        savingId.value = null
    }
}

function openCreateDialog() {
    form.value = { name: '', description: '' }
    createDialog.value = true
}

function openEditDialog(func: SystemFunction) {
    selectedFunc.value = func
    form.value = { name: func.name, description: func.description ?? '' }
    editDialog.value = true
}

function openDeleteDialog(func: SystemFunction) {
    selectedFunc.value = func
    deleteDialog.value = true
}

async function createFunction() {
    if (!form.value.name.trim()) return
    formLoading.value = true
    try {
        await $api('/function', { method: 'POST', body: form.value })
        showSnackbar('Function berjaya dicipta')
        createDialog.value = false
        await loadData()
    } catch {
        showSnackbar('Gagal mencipta function', 'error')
    } finally {
        formLoading.value = false
    }
}

async function updateFunction() {
    if (!selectedFunc.value || !form.value.name.trim()) return
    formLoading.value = true
    try {
        await $api(`/function/${selectedFunc.value.id}`, { method: 'PATCH', body: form.value })
        showSnackbar('Function berjaya dikemaskini')
        editDialog.value = false
        await loadData()
    } catch {
        showSnackbar('Gagal mengemaskini function', 'error')
    } finally {
        formLoading.value = false
    }
}

async function deleteFunction() {
    if (!selectedFunc.value) return
    formLoading.value = true
    try {
        await $api(`/function/${selectedFunc.value.id}`, { method: 'DELETE' })
        showSnackbar('Function berjaya dipadam')
        deleteDialog.value = false
        await loadData()
    } catch {
        showSnackbar('Gagal memadam function', 'error')
    } finally {
        formLoading.value = false
    }
}

function openAddPermDialog(funcId: string) {
    addPermFuncId.value = funcId
    addPermName.value = ''
    addPermDialog.value = true
}

async function addPermission() {
    if (!addPermName.value.trim() || !addPermFuncId.value) return
    addPermLoading.value = true
    try {
        await $api(`/function/${addPermFuncId.value}/permission`, {
            method: 'POST',
            body: { name: addPermName.value.trim() },
        })
        showSnackbar('Permission berjaya ditambah')
        addPermDialog.value = false
        await loadData()
    } catch {
        showSnackbar('Gagal menambah permission', 'error')
    } finally {
        addPermLoading.value = false
    }
}

async function removePermission(func: SystemFunction, permId: string) {
    try {
        await $api(`/function/${func.id}/permission/${permId}`, { method: 'DELETE' })
        showSnackbar('Permission berjaya dipadam')
        await loadData()
    } catch {
        showSnackbar('Gagal memadam permission', 'error')
    }
}

function showSnackbar(message: string, color = 'success') {
    snackbarMessage.value = message
    snackbarColor.value = color
    snackbar.value = true
}

onMounted(() => {
    loadData()
})
</script>

<template>
    <div>
        <v-breadcrumbs :items="['Pengurusan Pengguna', 'Kumpulan Pengguna', userGroup?.name ?? '...', 'Function']" />

        <!-- Page Header -->
        <div class="d-flex flex-column flex-sm-row align-sm-center justify-sm-space-between pt-6 pb-5 gap-3">
            <div class="d-flex align-center gap-3">
                <v-btn icon="mdi-arrow-left" variant="text" :to="`/user-group`" />
                <div>
                    <div class="text-h6 font-weight-bold">Function & Permission</div>
                    <div class="text-body-2 text-medium-emphasis">
                        Kumpulan: <strong>{{ userGroup?.name ?? '...' }}</strong>
                    </div>
                </div>
            </div>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
                Tambah Function
            </v-btn>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-center py-16">
            <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Accordion List -->
        <v-expansion-panels v-else-if="functions.length > 0" v-model="openPanels" multiple variant="accordion"
            class="function-panels">
            <v-expansion-panel v-for="func in functions" :key="func.id" :value="func.id" rounded="lg" class="mb-3 border">

                <!-- Panel Header -->
                <v-expansion-panel-title>
                    <div class="d-flex align-center justify-space-between w-100 pr-2">
                        <div class="d-flex align-center gap-3">
                            <v-avatar color="primary" variant="tonal" size="36" rounded="lg">
                                <v-icon size="18">mdi-shield-key</v-icon>
                            </v-avatar>
                            <div>
                                <div class="text-body-1 font-weight-semibold">{{ func.name }}</div>
                                <div class="text-caption text-medium-emphasis">{{ func.description || '-' }}</div>
                            </div>
                        </div>
                        <div class="d-flex align-center gap-3">
                            <v-chip size="small" :color="getActiveCount(func) > 0 ? 'success' : 'default'"
                                variant="tonal">
                                {{ getActiveCount(func) }}/{{ func.permissions.length }} Permission
                            </v-chip>
                            <v-menu location="bottom end">
                                <template #activator="{ props }">
                                    <v-icon icon="mdi-dots-vertical" size="small" class="cursor-pointer"
                                        v-bind="props" @click.stop />
                                </template>
                                <v-list density="compact" min-width="140">
                                    <v-list-item prepend-icon="mdi-pencil" title="Edit"
                                        @click.stop="openEditDialog(func)" />
                                    <v-divider />
                                    <v-list-item prepend-icon="mdi-delete" title="Padam" base-color="error"
                                        @click.stop="openDeleteDialog(func)" />
                                </v-list>
                            </v-menu>
                        </div>
                    </div>
                </v-expansion-panel-title>

                <!-- Panel Content - Permissions -->
                <v-expansion-panel-text>
                    <v-divider class="mb-4" />
                    <div class="text-caption text-medium-emphasis font-weight-medium mb-3 text-uppercase">
                        Permission
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                        <v-card v-for="perm in func.permissions" :key="perm.id" variant="outlined"
                            :color="perm.active ? 'primary' : 'default'"
                            class="permission-card cursor-pointer px-3 py-3"
                            :class="{ 'active-permission': perm.active }"
                            @click="perm.active = !perm.active" rounded="lg" min-width="130">
                            <div class="d-flex align-center gap-1">
                                <v-checkbox-btn v-model="perm.active" :color="perm.active ? 'primary' : 'default'"
                                    density="compact" hide-details @click.stop />
                                <span class="text-body-2 font-weight-medium flex-grow-1">{{ perm.label }}</span>
                                <v-icon icon="mdi-close" size="14" class="text-medium-emphasis delete-perm-icon"
                                    @click.stop="removePermission(func, perm.id)" />
                            </div>
                        </v-card>

                        <!-- Add Permission Button -->
                        <v-card variant="outlined" class="permission-card cursor-pointer px-3 py-3 add-perm-card"
                            rounded="lg" min-width="130" @click="openAddPermDialog(func.id)">
                            <div class="d-flex align-center gap-2 text-medium-emphasis">
                                <v-icon icon="mdi-plus" size="18" />
                                <span class="text-body-2">Add Permission</span>
                            </div>
                        </v-card>
                    </div>
                    <div class="d-flex justify-end mt-4">
                        <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-content-save"
                            :loading="savingId === func.id" @click="savePermissions(func)">
                            Simpan Permission
                        </v-btn>
                    </div>
                </v-expansion-panel-text>

            </v-expansion-panel>
        </v-expansion-panels>

        <!-- Empty State -->
        <div v-else class="d-flex flex-column align-center justify-center py-16 text-medium-emphasis">
            <v-icon size="64" color="grey-lighten-1">mdi-shield-off-outline</v-icon>
            <div class="text-body-1 mt-3">Tiada function ditetapkan</div>
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" class="mt-4" @click="openCreateDialog">
                Tambah Function
            </v-btn>
        </div>

        <!-- Create Dialog -->
        <v-dialog v-model="createDialog" max-width="500" persistent>
            <v-card rounded="lg">
                <v-card-title class="pa-4 pb-2">Tambah Function</v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                    <v-text-field v-model="form.name" label="Nama Function"
                        placeholder="cth: Financial Management" variant="outlined" density="comfortable"
                        class="mb-3" />
                    <v-textarea v-model="form.description" label="Keterangan (pilihan)" variant="outlined"
                        density="comfortable" rows="3" no-resize />
                </v-card-text>
                <v-divider />
                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-btn variant="text" color="grey" @click="createDialog = false" :disabled="formLoading">Batal</v-btn>
                    <v-btn color="primary" variant="flat" :loading="formLoading" :disabled="!form.name.trim()"
                        @click="createFunction">Simpan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Edit Dialog -->
        <v-dialog v-model="editDialog" max-width="500" persistent>
            <v-card rounded="lg">
                <v-card-title class="pa-4 pb-2">Kemaskini Function</v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                    <v-text-field v-model="form.name" label="Nama Function" variant="outlined"
                        density="comfortable" class="mb-3" />
                    <v-textarea v-model="form.description" label="Keterangan (pilihan)" variant="outlined"
                        density="comfortable" rows="3" no-resize />
                </v-card-text>
                <v-divider />
                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-btn variant="text" color="grey" @click="editDialog = false" :disabled="formLoading">Batal</v-btn>
                    <v-btn color="primary" variant="flat" :loading="formLoading" :disabled="!form.name.trim()"
                        @click="updateFunction">Kemaskini</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Dialog -->
        <v-dialog v-model="deleteDialog" max-width="420">
            <v-card rounded="lg">
                <v-card-title class="pa-4 pb-2 d-flex align-center gap-2">
                    <v-icon color="error">mdi-alert-circle</v-icon>
                    <span>Padam Function</span>
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                    Adakah anda pasti mahu memadam function
                    <strong>{{ selectedFunc?.name }}</strong>?
                    Tindakan ini tidak boleh dibatalkan.
                </v-card-text>
                <v-divider />
                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-btn variant="text" color="grey" @click="deleteDialog = false" :disabled="formLoading">Batal</v-btn>
                    <v-btn color="error" variant="flat" :loading="formLoading" @click="deleteFunction">Padam</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Add Permission Dialog -->
        <v-dialog v-model="addPermDialog" max-width="400" persistent>
            <v-card rounded="lg">
                <v-card-title class="pa-4 pb-2">Tambah Permission</v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                    <v-text-field v-model="addPermName" label="Nama Permission"
                        placeholder="cth: Import, Export, Approve..." variant="outlined" density="comfortable"
                        autofocus @keyup.enter="addPermission" />
                </v-card-text>
                <v-divider />
                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-btn variant="text" color="grey" @click="addPermDialog = false" :disabled="addPermLoading">
                        Batal
                    </v-btn>
                    <v-btn color="primary" variant="flat" :loading="addPermLoading"
                        :disabled="!addPermName.trim()" @click="addPermission">
                        Tambah
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
.permission-card {
    transition: all 0.2s ease;
    user-select: none;
}

.permission-card:hover {
    border-color: rgb(var(--v-theme-primary)) !important;
}

.active-permission {
    background-color: rgba(var(--v-theme-primary), 0.06) !important;
}

.add-perm-card {
    border-style: dashed !important;
}

.add-perm-card:hover {
    border-color: rgb(var(--v-theme-primary)) !important;
    color: rgb(var(--v-theme-primary));
}

.delete-perm-icon {
    opacity: 0;
    transition: opacity 0.15s ease;
}

.permission-card:hover .delete-perm-icon {
    opacity: 1;
}

:deep(.v-expansion-panel) {
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-expansion-panel-title) {
    padding: 16px 20px;
}

:deep(.v-expansion-panel-text__wrapper) {
    padding: 0 20px 20px;
}
</style>
