<script setup lang="ts">
import { ref, computed } from 'vue';
import { FileImportIcon, FileExportIcon, AlertCircleIcon, EditIcon, TrashIcon, PlusIcon, File3dIcon } from 'vue-tabler-icons';

const props = defineProps<{
  filter?: string[] // Array of buttons labels to show
}>();

// Emit event to parent
const emit = defineEmits<{
  buttonClick: [action: string]
}>();

// buttons color data
const buttons = ref([
    {label: 'Simpan', color: 'primary', icon: File3dIcon, action: 'save'},
    {label: 'Batal', color: 'secondary', icon: AlertCircleIcon, action: 'cancel'},
    {label: 'Hapus', color: 'error', icon: TrashIcon, action: 'delete'},
    {label: 'Ubah', color: 'warning', icon: EditIcon, action: 'edit'},
    {label: 'Tambah', color: 'success', icon: PlusIcon, action: 'add'},
    {label: 'Export', color: 'success', icon: FileExportIcon, action: 'export'},
    {label: 'Import', color: 'success', icon: FileImportIcon, action: 'import'},
]);

// Only show the filtered buttons
const displayedButtons = computed(() => {
  if (!props.filter) return buttons.value
  return buttons.value.filter(b => props.filter!.includes(b.label))
})

const handleClick = (action: string) => {
  emit('buttonClick', action);
};
</script>

<template>
    <div class="d-flex gap-2 align-center flex-column flex-wrap flex-xl-nowrap flex-sm-row fill-height">
        <v-btn v-for="(btn,i) in displayedButtons" :key="i" :color="btn.color" variant="flat" class="w-100 w-md-auto w-lg-auto w-xl-auto" @click="handleClick(btn.label)">
            <template #prepend>
                <component :is="btn.icon" :size="20" />
            </template>
            {{ btn.label }}
        </v-btn>
    </div>
</template>
