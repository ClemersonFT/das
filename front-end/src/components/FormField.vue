<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ label: string; erro?: string; dica?: string }>()
const id = useId()
</script>

<template>
  <div class="field" :class="{ 'field--erro': erro }">
    <label :for="id">{{ label }}</label>
    <slot :id="id" />
    <p v-if="erro" class="field__erro">{{ erro }}</p>
    <p v-else-if="dica" class="field__dica">{{ dica }}</p>
  </div>
</template>
