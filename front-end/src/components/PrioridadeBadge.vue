<script setup lang="ts">
import { PRIORIDADE, type Prioridade } from '../api/types'

defineProps<{ valor: Prioridade }>()
</script>

<template>
  <span class="badge badge--contorno" :class="`tom-${PRIORIDADE[valor].tom}`">{{ PRIORIDADE[valor].rotulo }}</span>
</template>
