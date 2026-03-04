<script setup lang="ts">
import { ref, computed } from 'vue'

// Go to login if dont have the session
definePageMeta({
  middleware: 'auth'
})
</script>

<template>
  <div>
    <v-breadcrumbs :items="['RPH']"></v-breadcrumbs>
  </div>

</template>