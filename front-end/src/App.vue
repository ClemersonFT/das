<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import ToastHost from './components/ToastHost.vue'
</script>

<template>
  <AppHeader />
  <main class="container main">
    <RouterView />
  </main>
  <ToastHost />
</template>
