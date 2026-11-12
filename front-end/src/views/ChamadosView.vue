<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type ChamadoFiltro } from '../api'
import { mensagemDeErro } from '../api/http'
import { PRIORIDADE, PRIORIDADE_LIST, STATUS, STATUS_LIST, type Chamado, type Prioridade, type StatusChamado } from '../api/types'
import ChamadosTable from '../components/ChamadosTable.vue'
import PageFoot from '../components/PageFoot.vue'
import PageHead from '../components/PageHead.vue'
import Pager from '../components/Pager.vue'
import StateBox from '../components/StateBox.vue'
import { useLookups } from '../composables/useLookups'

const POR_PAGINA = 10
const route = useRoute()
const router = useRouter()
const { clientes, carregar: carregarLookups } = useLookups()

const itens = ref<Chamado[]>([])
const total = ref(0)
const totalPaginas = ref(1)
const carregando = ref(true)
const primeiraCarga = ref(true)
const erro = ref('')

// Filtros e página vivem na URL: dá para compartilhar o link e o botão voltar funciona.
const filtro = computed<ChamadoFiltro>(() => {
  const q = route.query
  return {
    status: STATUS_LIST.find((s) => s === q.status),
    prioridade: PRIORIDADE_LIST.find((p) => p === q.prioridade),
    clienteId: Number(q.clienteId) || undefined,
  }
})
const pagina = computed(() => Math.max(1, Number(route.query.pagina) || 1))
const temFiltro = computed(() => Object.values(filtro.value).some((v) => v !== undefined))

function navegar(f: ChamadoFiltro, p = 1) {
  const query: Record<string, string> = {}
  if (f.status) query.status = f.status
  if (f.prioridade) query.prioridade = f.prioridade
  if (f.clienteId) query.clienteId = String(f.clienteId)
  if (p > 1) query.pagina = String(p)
  router.replace({ path: '/chamados', query })
}

const statusSel = computed({
  get: () => filtro.value.status ?? '',
  set: (v: string) => navegar({ ...filtro.value, status: STATUS_LIST.find((s) => s === v) }),
})
const prioridadeSel = computed({
  get: () => filtro.value.prioridade ?? '',
  set: (v: string) => navegar({ ...filtro.value, prioridade: PRIORIDADE_LIST.find((p) => p === v) }),
})
const clienteSel = computed<number | ''>({
  get: () => filtro.value.clienteId ?? '',
  set: (v) => navegar({ ...filtro.value, clienteId: v === '' ? undefined : v }),
})

let sequencia = 0
async function carregar() {
  const minha = ++sequencia
  carregando.value = true
  erro.value = ''
  try {
    const [res] = await Promise.all([
      api.chamados.listar(filtro.value, { page: pagina.value - 1, size: POR_PAGINA, sort: 'dataAbertura,desc' }),
      carregarLookups(),
    ])
    if (minha !== sequencia) return
    itens.value = res.content
    total.value = res.totalElements
    totalPaginas.value = Math.max(1, res.totalPages)
  } catch (e) {
    if (minha === sequencia) erro.value = mensagemDeErro(e)
  } finally {
    if (minha === sequencia) {
      carregando.value = false
      primeiraCarga.value = false
    }
  }
}

watch(
  () => route.fullPath,
  () => {
    if (route.name === 'chamados') carregar()
  },
  { immediate: true },
)

const de = computed(() => (total.value === 0 ? 0 : (pagina.value - 1) * POR_PAGINA + 1))
const ate = computed(() => Math.min(pagina.value * POR_PAGINA, total.value))
</script>

<template>
  <section>
    <PageHead title="Chamados" lede="Filtre por status, prioridade ou cliente. Clique em um chamado para acompanhar e responder." />

    <div class="toolbar">
      <div class="filters">
        <select v-model="statusSel" aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          <option v-for="s in STATUS_LIST" :key="s" :value="s">{{ STATUS[s as StatusChamado].rotulo }}</option>
        </select>
        <select v-model="prioridadeSel" aria-label="Filtrar por prioridade">
          <option value="">Todas as prioridades</option>
          <option v-for="p in PRIORIDADE_LIST" :key="p" :value="p">{{ PRIORIDADE[p as Prioridade].rotulo }}</option>
        </select>
        <select v-model="clienteSel" aria-label="Filtrar por cliente">
          <option value="">Todos os clientes</option>
          <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
        <button v-if="temFiltro" type="button" class="btn btn--ghost btn--sm" @click="navegar({})">Limpar filtros</button>
      </div>
    </div>

    <StateBox v-if="erro" tone="erro" title="Não foi possível carregar os chamados" :text="erro">
      <button type="button" class="btn" @click="carregar">Tentar de novo</button>
    </StateBox>
    <StateBox v-else-if="primeiraCarga" tone="carregando" title="Carregando chamados" />
    <StateBox
      v-else-if="!itens.length"
      :title="temFiltro ? 'Nenhum chamado com esses filtros' : 'Nenhum chamado ainda'"
      :text="temFiltro ? 'Tente outro status, prioridade ou cliente.' : 'Abra o primeiro chamado para ele aparecer aqui.'"
    >
      <button v-if="temFiltro" type="button" class="btn" @click="navegar({})">Limpar filtros</button>
      <RouterLink v-else to="/chamados/novo" class="btn btn--primary">Abrir chamado</RouterLink>
    </StateBox>
    <div v-else :class="{ 'is-loading': carregando }">
      <ChamadosTable :itens="itens" />
    </div>

    <PageFoot>
      <template #left>
        <span class="muted">{{ total ? `Mostrando ${de} a ${ate} de ${total}` : 'Nenhum resultado' }}</span>
      </template>
      <template #right>
        <Pager v-if="totalPaginas > 1" :pagina="pagina" :total-paginas="totalPaginas" @ir="(p) => navegar(filtro, p)" />
      </template>
    </PageFoot>
  </section>
</template>
