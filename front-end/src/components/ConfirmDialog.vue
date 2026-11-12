<script setup lang="ts">
import Modal from './Modal.vue'

withDefaults(
  defineProps<{ open: boolean; title: string; message: string; confirmLabel: string; loading?: boolean; perigo?: boolean }>(),
  { perigo: true },
)
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Modal :open="open" :title="title" @close="$emit('cancel')">
    <p class="prose">{{ message }}</p>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="$emit('cancel')">Cancelar</button>
      <button type="button" class="btn" :class="perigo ? 'btn--danger-solid' : 'btn--primary'" :disabled="loading" @click="$emit('confirm')">
        {{ confirmLabel }}
      </button>
    </template>
  </Modal>
</template>
