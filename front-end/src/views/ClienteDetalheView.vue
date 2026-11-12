<script setup lang="ts">
import { ref, watch } from 'vue'
import { api } from '../api'
import { mensagemDeErro } from '../api/http'
import type { Chamado, Cliente } from '../api/types'
import ChamadosTable from '../components/ChamadosTable.vue'
import PageFoot from '../components/PageFoot.vue'
import PageHead from '../components/PageHead.vue'
import Pager from '../components/Pager.vue'
import StateBox from '../components/StateBox.vue'
import { useLookups } from '../composables/useLookups'

const POR_PAGINA = 10
const props = defineProps<{ id: string }>()
const { carregar: carregarLookups } = useLookups()

const cliente = ref<Cliente | null>(null)
const itens = ref<Chamado[]>([])
const total = ref(0)
const totalPaginas = ref(1)
const pagina = ref(1)
const carregando = ref(true)
const erro = ref('')

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const id = Number(props.id)
    const [c, res] = await Promise.all([
      api.clientes.buscar(id),
      api.clientes.chamados(id, { page: pagina.value - 1, size: POR_PAGINA, sort: 'dataAbertura,desc' }),
      carregarLookups(),
    ])
    cliente.value = c
    itens.value = res.content
    total.value = res.totalElements
    totalPaginas.value = Math.max(1, res.totalPages)
  } catch (e) {
    erro.value = mensagemDeErro(e)
  } finally {
    carregando.value = false
  }
}

watch([() => props.id, pagina], carregar, { immediate: true })
</script>

<template>
  <section>
    <StateBox v-if="erro" tone="erro" title="Não foi possível abrir o cliente" :text="erro">
      <RouterLink to="/clientes" class="btn">Voltar para clientes</RouterLink>
      <button type="button" class="btn btn--primary" @click="carregar">Tentar de novo</button>
    </StateBox>
    <StateBox v-else-if="!cliente" tone="carregando" title="Carregando cliente" />
    <template v-else>
      <PageHead :title="cliente.nome" :lede="cliente.telefone ? `${cliente.email}, ${cliente.telefone}` : cliente.email">
        <template #voltar><RouterLink to="/clientes" class="crumb">Voltar para clientes</RouterLink></template>
        <RouterLink :to="{ path: '/chamados/novo', query: { clienteId: cliente.id } }" class="btn">Abrir chamado para este cliente</RouterLink>
      </PageHead>

      <header class="secao-cab"><h2>Chamados deste cliente</h2></header>
      <div v-if="itens.length" :class="{ 'is-loading': carregando }">
        <ChamadosTable :itens="itens" sem-cliente />
      </div>
      <StateBox v-else title="Este cliente não tem chamados" text="Quando um chamado for aberto para ele, aparece aqui.">
        <RouterLink :to="{ path: '/chamados/novo', query: { clienteId: cliente.id } }" class="btn btn--primary">Abrir chamado</RouterLink>
      </StateBox>

      <PageFoot>
        <template #left><span class="muted">{{ total }} {{ total === 1 ? 'chamado' : 'chamados' }}</span></template>
        <template #right>
          <Pager v-if="totalPaginas > 1" :pagina="pagina" :total-paginas="totalPaginas" @ir="(p) => (pagina = p)" />
          <RouterLink v-else :to="{ path: '/chamados/novo', query: { clienteId: cliente.id } }" class="btn btn--primary">Abrir chamado</RouterLink>
        </template>
      </PageFoot>
    </template>
  </section>
</template>

<style scoped>
.secao-cab { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
</style>
