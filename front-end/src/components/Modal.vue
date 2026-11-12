<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
const dialogo = ref<HTMLDialogElement | null>(null)

watch(
  () => props.open,
  async (aberto) => {
    await nextTick()
    const el = dialogo.value
    if (!el) return
    if (aberto && !el.open) el.showModal()
    else if (!aberto && el.open) el.close()
  },
  { immediate: true },
)
</script>

<template>
  <dialog ref="dialogo" class="modal" @cancel.prevent="emit('close')" @mousedown.self="emit('close')">
    <div v-if="open" class="modal__panel">
      <header class="modal__head">
        <h2>{{ title }}</h2>
        <button type="button" class="icon-btn" aria-label="Fechar" @click="emit('close')">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
      </header>
      <div class="modal__body"><slot /></div>
      <footer class="modal__foot"><slot name="footer" /></footer>
    </div>
  </dialog>
</template>
