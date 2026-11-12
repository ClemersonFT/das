<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, fechar } = useToast()
</script>

<template>
  <div class="toasts" aria-live="polite">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="{ 'toast--erro': t.tom === 'erro' }" role="status">
      <span>{{ t.texto }}</span>
      <button type="button" class="toast__x" aria-label="Fechar aviso" @click="fechar(t.id)">
        <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </button>
    </div>
  </div>
</template>
