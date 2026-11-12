<script setup lang="ts">
import StateBox from '../components/StateBox.vue'
</script>

<template>
  <section class="pagina-simples">
    <StateBox title="Página não encontrada" text="O endereço não existe neste sistema. Volte ao painel para continuar.">
      <RouterLink to="/" class="btn btn--primary">Ir para o painel</RouterLink>
    </StateBox>
  </section>
</template>

<style scoped>
.pagina-simples { padding: 64px 0; }
</style>
