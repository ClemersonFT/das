<script setup lang="ts">
defineProps<{ pagina: number; totalPaginas: number }>()
defineEmits<{ ir: [pagina: number] }>()
</script>

<template>
  <nav class="pager" aria-label="Paginação">
    <button type="button" class="btn" :disabled="pagina <= 1" @click="$emit('ir', pagina - 1)">
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="m12 4-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      Página anterior
    </button>
    <span class="pager__info">{{ pagina }} de {{ totalPaginas }}</span>
    <button type="button" class="btn btn--primary" :disabled="pagina >= totalPaginas" @click="$emit('ir', pagina + 1)">
      Próxima página
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="m8 4 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
  </nav>
</template>
