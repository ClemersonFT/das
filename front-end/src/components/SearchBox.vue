<script setup lang="ts">
const modelo = defineModel<string>({ default: '' })
defineProps<{ placeholder: string }>()
</script>

<template>
  <label class="search">
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <circle cx="9" cy="9" r="5.8" fill="none" stroke="currentColor" stroke-width="1.8" />
      <path d="m13.5 13.5 3.8 3.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
    <input v-model="modelo" type="search" :placeholder="placeholder" :aria-label="placeholder" />
  </label>
</template>
