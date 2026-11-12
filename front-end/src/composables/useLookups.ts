import { computed, ref } from 'vue'
import { api } from '../api'
import type { Categoria, Cliente, Tecnico } from '../api/types'

// Os DTOs de chamado trazem só IDs; aqui guardamos as listas para mostrar nomes.
const clientes = ref<Cliente[]>([])
const categorias = ref<Categoria[]>([])
const tecnicos = ref<Tecnico[]>([])
const carregado = ref(false)
let emAndamento: Promise<void> | null = null

const porId = <T extends { id: number }>(lista: T[]) => new Map(lista.map((i) => [i.id, i]))
const mapaClientes = computed(() => porId(clientes.value))
const mapaCategorias = computed(() => porId(categorias.value))
const mapaTecnicos = computed(() => porId(tecnicos.value))

function carregar(forcar = false): Promise<void> {
  if (carregado.value && !forcar) return Promise.resolve()
  emAndamento ??= Promise.all([api.clientes.listar(), api.categorias.listar(), api.tecnicos.listar()])
    .then(([c, k, t]) => {
      clientes.value = c
      categorias.value = k
      tecnicos.value = t
      carregado.value = true
    })
    .finally(() => {
      emAndamento = null
    })
  return emAndamento
}

export const useLookups = () => ({
  clientes,
  categorias,
  tecnicos,
  carregado,
  carregar,
  nomeCliente: (id: number) => mapaClientes.value.get(id)?.nome ?? `Cliente ${id}`,
  nomeCategoria: (id: number) => mapaCategorias.value.get(id)?.nome ?? `Categoria ${id}`,
  nomeTecnico: (id: number | null) => (id === null ? 'Sem técnico' : (mapaTecnicos.value.get(id)?.nome ?? `Técnico ${id}`)),
})
