<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '../api'
import { mensagemDeErro } from '../api/http'
import { PRIORIDADE, PRIORIDADE_LIST, STATUS, STATUS_LIST, type Chamado, type Prioridade, type StatusChamado } from '../api/types'
import ChamadosTable from '../components/ChamadosTable.vue'
import StateBox from '../components/StateBox.vue'
import { useLookups } from '../composables/useLookups'

const { carregar: carregarLookups } = useLookups()

const carregando = ref(true)
const erro = ref('')
const porStatus = ref<Record<StatusChamado, number>>({ ABERTO: 0, EM_ATENDIMENTO: 0, AGUARDANDO_CLIENTE: 0, FECHADO: 0 })
const porPrioridade = ref<Record<Prioridade, number>>({ BAIXA: 0, MEDIA: 0, ALTA: 0, CRITICA: 0 })
const recentes = ref<Chamado[]>([])

const total = computed(() => STATUS_LIST.reduce((soma, s) => soma + porStatus.value[s], 0))
const prioridades = [...PRIORIDADE_LIST].reverse()
const pct = (n: number) => (total.value ? Math.round((n / total.value) * 100) : 0)

// O back-end não tem endpoint de totais: pedimos uma página de 1 item e lemos totalElements.
async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const um = { size: 1 }
    const [contStatus, contPrioridade, recente] = await Promise.all([
      Promise.all(STATUS_LIST.map((s) => api.chamados.listar({ status: s }, um))),
      Promise.all(PRIORIDADE_LIST.map((p) => api.chamados.listar({ prioridade: p }, um))),
      api.chamados.listar({}, { size: 5, sort: 'dataAbertura,desc' }),
      carregarLookups(),
    ])
    STATUS_LIST.forEach((s, i) => (porStatus.value[s] = contStatus[i]!.totalElements))
    PRIORIDADE_LIST.forEach((p, i) => (porPrioridade.value[p] = contPrioridade[i]!.totalElements))
    recentes.value = recente.content
  } catch (e) {
    erro.value = mensagemDeErro(e)
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <section>
    <!-- Z inteiro numa tela: título (topo esquerdo), cabeçalho com a ação (topo direito),
         tickets descendo em diagonal até o canto esquerdo, ação final no canto direito -->
    <div class="hero">
      <div class="hero__intro">
        <h1>Painel de chamados</h1>
        <p class="lede">Cada chamado segue o mesmo caminho, da abertura ao fechamento.</p>
      </div>

      <StateBox v-if="erro" class="hero__erro" tone="erro" title="Não foi possível carregar o painel" :text="erro">
        <button type="button" class="btn" @click="carregar">Tentar de novo</button>
      </StateBox>

      <template v-else-if="!carregando">
        <RouterLink
          v-for="(s, i) in STATUS_LIST"
          :key="s"
          :to="{ path: '/chamados', query: { status: s } }"
          class="ticket"
          :class="`tom-${STATUS[s].tom}`"
          :style="{ '--i': i, '--col': 4 - i, '--lin': `${i + 1} / span 2` }"
          :aria-label="`${porStatus[s]} ${STATUS[s].plural.toLowerCase()}: ver chamados`"
        >
          <span class="ticket__corpo">
            <span class="ticket__topo">
              <span class="ticket__nome">{{ STATUS[s].plural }}</span>
              <span class="ticket__etapa" aria-hidden="true">{{ i + 1 }}</span>
            </span>
            <span class="ticket__numero">{{ porStatus[s] }}</span>
          </span>
          <span class="ticket__canhoto">
            {{ STATUS[s].dica }}
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="m8 4 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
        </RouterLink>

        <div class="hero__fim">
          <p class="muted">{{ total }} {{ total === 1 ? 'chamado' : 'chamados' }} no total</p>
          <RouterLink to="/chamados" class="btn btn--primary btn--lg">Ver todos os chamados</RouterLink>
        </div>
      </template>
    </div>

    <div v-if="!erro && !carregando" class="secundario">
      <section>
        <header class="secao-cab">
          <h2>Chamados recentes</h2>
          <RouterLink to="/chamados" class="link">Ver todos</RouterLink>
        </header>
        <ChamadosTable v-if="recentes.length" :itens="recentes" compacto />
        <StateBox v-else title="Nenhum chamado ainda" text="Abra o primeiro chamado para ele aparecer aqui.">
          <RouterLink to="/chamados/novo" class="btn btn--primary">Abrir chamado</RouterLink>
        </StateBox>
      </section>

      <section>
        <header class="secao-cab"><h2>Por prioridade</h2></header>
        <ul class="painel barras">
          <li v-for="p in prioridades" :key="p" :class="`tom-${PRIORIDADE[p].tom}`">
            <RouterLink :to="{ path: '/chamados', query: { prioridade: p } }" class="barras__linha">
              <span class="barras__rotulo">{{ PRIORIDADE[p].rotulo }}</span>
              <span class="barras__trilho"><span class="barras__preenchimento" :style="{ width: pct(porPrioridade[p]) + '%' }" /></span>
              <span class="barras__n">{{ porPrioridade[p] }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding-top: clamp(28px, 5vw, 48px);
}
.hero__intro,
.hero__fim,
.hero__erro {
  grid-column: 1 / -1;
}
.hero__intro { display: grid; gap: 12px; align-content: start; }
.hero__fim { display: grid; justify-items: end; gap: 10px; padding-top: 8px; }

.ticket {
  --raio: 11px;
  --corte: 68%;
  display: grid;
  grid-template-rows: var(--corte) 1fr;
  height: 188px;
  border-radius: 14px;
  color: var(--t-fg);
  text-decoration: none;
  /* corpo colorido + canhoto branco, separados por um picote tracejado */
  background:
    repeating-linear-gradient(90deg, var(--t-fg) 0 5px, transparent 5px 10px) 0 calc(var(--corte) - 1px) / 100% 1.5px no-repeat,
    linear-gradient(to bottom, var(--t-bg) var(--corte), var(--papel) 0);
  /* recortes semicirculares nas laterais, na altura do picote */
  -webkit-mask:
    radial-gradient(circle var(--raio) at 0 var(--corte), #0000 calc(100% - .5px), #000) left / 51% 100% no-repeat,
    radial-gradient(circle var(--raio) at 100% var(--corte), #0000 calc(100% - .5px), #000) right / 51% 100% no-repeat;
  mask:
    radial-gradient(circle var(--raio) at 0 var(--corte), #0000 calc(100% - .5px), #000) left / 51% 100% no-repeat,
    radial-gradient(circle var(--raio) at 100% var(--corte), #0000 calc(100% - .5px), #000) right / 51% 100% no-repeat;
  animation: emitir 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
  animation-delay: calc(var(--i) * 120ms);
}
.ticket:focus-visible { outline: none; box-shadow: inset 0 0 0 3px var(--foco); }
.ticket__corpo { display: grid; grid-template-rows: auto 1fr; padding: 14px 18px 0; }
.ticket__topo { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.ticket__nome { font-weight: 700; font-size: 1rem; }
.ticket__etapa {
  display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%;
  border: 1.5px solid currentColor; font-size: .8rem; font-weight: 700;
}
.ticket__numero {
  align-self: end;
  font-family: var(--font-display);
  font-stretch: 72%;
  font-weight: 800;
  font-size: clamp(3.25rem, 9vw, 4.25rem);
  line-height: .86;
  padding-bottom: 8px;
  font-variant-numeric: tabular-nums;
}
.ticket__canhoto {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  padding: 0 18px; color: var(--tinta-2); font-size: .92rem;
}

.secundario > section { min-width: 0; }
.secundario { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; margin-top: 64px; padding-bottom: 72px; }
.secao-cab { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 14px; }

.barras { display: grid; gap: 4px; padding: 10px; }
.barras__linha {
  display: grid; grid-template-columns: 4.5rem 1fr 2rem; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 8px; text-decoration: none;
}
.barras__linha:hover { background: #f3f6fa; }
.barras__rotulo { font-weight: 600; }
.barras__trilho { height: 10px; border-radius: 5px; background: var(--fundo); overflow: hidden; }
.barras__preenchimento { display: block; height: 100%; min-width: 4px; border-radius: 5px; background: var(--t-dot); }
.barras__n { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }

@keyframes emitir {
  from { opacity: 0; transform: translate(22px, -22px); }
}
@media (prefers-reduced-motion: reduce) {
  .ticket { animation: none; }
}

@media (min-width: 900px) {
  .hero { grid-template-columns: repeat(4, minmax(0, 1fr)); grid-template-rows: repeat(5, 80px); }
  .hero__intro { grid-column: 1 / span 2; grid-row: 1 / span 2; }
  .hero__erro { grid-row: 3 / span 3; align-self: start; }
  .ticket { height: auto; grid-column: var(--col); grid-row: var(--lin); }
  .hero__fim { grid-column: 3 / span 2; grid-row: 4 / span 2; align-self: end; padding-top: 0; }
  .secundario { grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr); gap: 32px; }
}
</style>
