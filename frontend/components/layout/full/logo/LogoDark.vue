<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
const primary = ref('rgb(var(--v-theme-primary))');
const secondary = ref('rgb(var(--v-theme-secondary))');
</script>
<template>
    <div class="logo">
        <NuxtLink
        to="/"
        class="flex items-center gap-4 no-underline"
        >
        <img
            src="/images/logos/sk_karai.png"
            alt="Logo Sekolah"
            class="h-[50px] w-auto block"
        />
        <h2 class="m-0 font-semibold">
            SK Karai
        </h2>
        </NuxtLink>
    </div>
</template>
