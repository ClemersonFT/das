<script setup lang="ts">
defineProps<{ title: string; lede?: string }>()
</script>

<template>
  <!-- Z, traço 1 da página: título à esquerda, ação à direita -->
  <div class="page-head">
    <div class="page-head__text">
      <slot name="voltar" />
      <h1>{{ title }}</h1>
      <slot name="meta" />
      <p v-if="lede" class="lede">{{ lede }}</p>
    </div>
    <div class="page-head__actions"><slot /></div>
  </div>
</template>
