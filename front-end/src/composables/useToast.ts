import { ref } from 'vue'

export interface Toast { id: number; tom: 'ok' | 'erro'; texto: string }

const toasts = ref<Toast[]>([])
let seq = 0

function mostrar(texto: string, tom: Toast['tom']) {
  const id = ++seq
  toasts.value.push({ id, tom, texto })
  setTimeout(() => fechar(id), tom === 'erro' ? 7000 : 3500)
}

function fechar(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

export const useToast = () => ({
  toasts,
  ok: (texto: string) => mostrar(texto, 'ok'),
  erro: (texto: string) => mostrar(texto, 'erro'),
  fechar,
})
