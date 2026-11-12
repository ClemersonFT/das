<script setup lang="ts">
import { STATUS, type StatusChamado } from '../api/types'

defineProps<{ valor: StatusChamado }>()
</script>

<template>
  <span class="badge" :class="`tom-${STATUS[valor].tom}`">{{ STATUS[valor].rotulo }}</span>
</template>
