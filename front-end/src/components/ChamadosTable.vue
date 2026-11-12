<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Chamado } from '../api/types'
import { useLookups } from '../composables/useLookups'
import { formatarData, senha } from '../utils'
import PrioridadeBadge from './PrioridadeBadge.vue'
import StatusBadge from './StatusBadge.vue'

defineProps<{ itens: Chamado[]; semCliente?: boolean; compacto?: boolean }>()

const router = useRouter()
const { nomeCliente, nomeCategoria, nomeTecnico } = useLookups()
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Nº</th>
          <th>Chamado</th>
          <th v-if="!compacto">Categoria</th>
          <th v-if="!compacto">Prioridade</th>
          <th>Status</th>
          <th v-if="!compacto">Técnico</th>
          <th>Aberto em</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in itens" :key="c.id" class="row-link" @click="router.push(`/chamados/${c.id}`)">
          <td><span class="senha">{{ senha(c.id) }}</span></td>
          <td>
            <RouterLink :to="`/chamados/${c.id}`" class="cell-title" @click.stop>{{ c.titulo }}</RouterLink>
            <span v-if="!semCliente" class="cell-sub">{{ nomeCliente(c.clienteId) }}</span>
          </td>
          <td v-if="!compacto">{{ nomeCategoria(c.categoriaId) }}</td>
          <td v-if="!compacto"><PrioridadeBadge :valor="c.prioridade" /></td>
          <td><StatusBadge :valor="c.status" /></td>
          <td v-if="!compacto" :class="{ muted: c.tecnicoId === null }">{{ nomeTecnico(c.tecnicoId) }}</td>
          <td class="nowrap">{{ formatarData(c.dataAbertura) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
