<script setup lang="ts">
defineProps<{ tone?: 'vazio' | 'erro' | 'carregando'; title?: string; text?: string }>()
</script>

<template>
  <div class="state" :class="`state--${tone ?? 'vazio'}`" :role="tone === 'erro' ? 'alert' : undefined">
    <span v-if="tone === 'carregando'" class="spinner" aria-hidden="true" />
    <svg v-else-if="tone === 'erro'" class="state__icone" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <path d="M12 3.5 2.8 19.5h18.4Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      <path d="M12 10v4.5M12 17.2v.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <svg v-else class="state__icone" viewBox="0 0 28 28" width="34" height="34" aria-hidden="true">
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h17A2.5 2.5 0 0 1 25 8.5v2.6a3 3 0 0 0 0 5.8v2.6a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 3 19.5v-2.6a3 3 0 0 0 0-5.8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
    </svg>
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="text">{{ text }}</p>
    <div class="state__acoes"><slot /></div>
  </div>
</template>
