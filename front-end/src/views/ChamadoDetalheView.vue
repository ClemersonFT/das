<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { mensagemDeErro, mensagemExclusao } from '../api/http'
import { STATUS, STATUS_LIST, type Chamado, type ChamadoDetalhe, type StatusChamado } from '../api/types'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import PageHead from '../components/PageHead.vue'
import PrioridadeBadge from '../components/PrioridadeBadge.vue'
import StateBox from '../components/StateBox.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useLookups } from '../composables/useLookups'
import { useToast } from '../composables/useToast'
import { formatarData, iniciais, senha } from '../utils'

const props = defineProps<{ id: string }>()
const router = useRouter()
const toast = useToast()
const { tecnicos, nomeCliente, nomeCategoria, carregar: carregarLookups } = useLookups()

const chamado = ref<ChamadoDetalhe | null>(null)
const erro = ref('')
const fechado = computed(() => chamado.value?.status === 'FECHADO')

const tecnicoSel = ref<number | ''>('')
const ocupado = ref(false)
const confirmando = ref<'fechar' | 'excluir' | null>(null)

const autor = ref(localStorage.getItem('chamados:autor') ?? '')
const texto = ref('')
const enviando = ref(false)
const erroComentario = ref('')

async function carregar() {
  erro.value = ''
  try {
    const [c] = await Promise.all([api.chamados.buscar(Number(props.id)), carregarLookups()])
    chamado.value = c
    tecnicoSel.value = c.tecnicoId ?? ''
  } catch (e) {
    erro.value = mensagemDeErro(e)
  }
}
watch(() => props.id, carregar, { immediate: true })

// Os PATCH devolvem o chamado sem os comentários; mesclamos para não perdê-los.
async function executar(acao: () => Promise<Chamado>, sucesso: string) {
  if (!chamado.value) return
  ocupado.value = true
  try {
    Object.assign(chamado.value, await acao())
    tecnicoSel.value = chamado.value.tecnicoId ?? ''
    toast.ok(sucesso)
  } catch (e) {
    toast.erro(mensagemDeErro(e))
  } finally {
    ocupado.value = false
  }
}

function mudarStatus(s: StatusChamado) {
  if (s === chamado.value?.status) return
  if (s === 'FECHADO') confirmando.value = 'fechar'
  else executar(() => api.chamados.alterarStatus(Number(props.id), s), `Status alterado para ${STATUS[s].rotulo.toLowerCase()}`)
}

function atribuir() {
  if (tecnicoSel.value === '') return
  executar(() => api.chamados.atribuir(Number(props.id), Number(tecnicoSel.value)), 'Técnico atribuído')
}

async function fecharChamado() {
  confirmando.value = null
  await executar(() => api.chamados.alterarStatus(Number(props.id), 'FECHADO'), 'Chamado fechado')
}

async function excluir() {
  ocupado.value = true
  try {
    await api.chamados.excluir(Number(props.id))
    toast.ok('Chamado excluído')
    router.replace('/chamados')
  } catch (e) {
    toast.erro(mensagemExclusao(e, 'este chamado'))
    confirmando.value = null
  } finally {
    ocupado.value = false
  }
}

async function comentar() {
  enviando.value = true
  erroComentario.value = ''
  try {
    const novo = await api.chamados.comentar(Number(props.id), { autor: autor.value.trim(), texto: texto.value.trim() })
    chamado.value?.comentarios.push(novo)
    localStorage.setItem('chamados:autor', autor.value.trim())
    texto.value = ''
    toast.ok('Comentário enviado')
  } catch (e) {
    erroComentario.value = mensagemDeErro(e)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <section>
    <StateBox v-if="erro" tone="erro" title="Não foi possível abrir o chamado" :text="erro">
      <RouterLink to="/chamados" class="btn">Voltar para chamados</RouterLink>
      <button type="button" class="btn btn--primary" @click="carregar">Tentar de novo</button>
    </StateBox>
    <StateBox v-else-if="!chamado" tone="carregando" title="Carregando chamado" />

    <template v-else>
      <PageHead :title="chamado.titulo">
        <template #voltar><RouterLink to="/chamados" class="crumb">Voltar para chamados</RouterLink></template>
        <template #meta>
          <div class="selos">
            <span class="senha">{{ senha(chamado.id) }}</span>
            <StatusBadge :valor="chamado.status" />
            <PrioridadeBadge :valor="chamado.prioridade" />
          </div>
        </template>
        <RouterLink v-if="!fechado" :to="`/chamados/${chamado.id}/editar`" class="btn">Editar chamado</RouterLink>
      </PageHead>

      <div class="layout">
        <!-- Z, diagonal: a coluna da direita (andamento) puxa o olhar para a descrição e, por fim, para os comentários -->
        <aside class="lateral">
          <section class="painel">
            <h2 class="h-sm">Andamento</h2>
            <p v-if="fechado" class="alert alert--info">Chamado fechado. Status e técnico não podem mais ser alterados.</p>
            <div class="passos" role="group" aria-label="Status do chamado">
              <button
                v-for="s in STATUS_LIST"
                :key="s"
                type="button"
                class="passo"
                :class="[`tom-${STATUS[s].tom}`, { 'is-atual': s === chamado.status }]"
                :aria-pressed="s === chamado.status"
                :disabled="fechado || ocupado"
                @click="mudarStatus(s)"
              >
                {{ STATUS[s].rotulo }}
              </button>
            </div>

            <div class="field">
              <label for="tecnico">Técnico responsável</label>
              <div class="inline">
                <select id="tecnico" v-model="tecnicoSel" :disabled="fechado || ocupado">
                  <option value="" disabled>Sem técnico</option>
                  <option v-for="t in tecnicos" :key="t.id" :value="t.id">{{ t.nome }}</option>
                </select>
                <button type="button" class="btn" :disabled="fechado || ocupado || tecnicoSel === '' || tecnicoSel === chamado.tecnicoId" @click="atribuir">
                  Atribuir técnico
                </button>
              </div>
            </div>
          </section>

          <section class="painel">
            <h2 class="h-sm">Detalhes</h2>
            <dl class="dl">
              <dt>Cliente</dt>
              <dd><RouterLink :to="`/clientes/${chamado.clienteId}`" class="link">{{ nomeCliente(chamado.clienteId) }}</RouterLink></dd>
              <dt>Categoria</dt>
              <dd>{{ nomeCategoria(chamado.categoriaId) }}</dd>
              <dt>Aberto em</dt>
              <dd>{{ formatarData(chamado.dataAbertura, true) }}</dd>
              <template v-if="chamado.dataFechamento">
                <dt>Fechado em</dt>
                <dd>{{ formatarData(chamado.dataFechamento, true) }}</dd>
              </template>
            </dl>
          </section>

          <button type="button" class="btn btn--danger btn--sm" :disabled="ocupado" @click="confirmando = 'excluir'">Excluir chamado</button>
        </aside>

        <div class="principal">
          <section class="painel">
            <h2 class="h-sm">Descrição</h2>
            <p v-if="chamado.descricao" class="prose">{{ chamado.descricao }}</p>
            <p v-else class="muted">Este chamado não tem descrição.</p>
          </section>

          <section class="painel">
            <h2 class="h-sm">Comentários <span class="contagem">{{ chamado.comentarios.length }}</span></h2>
            <ol v-if="chamado.comentarios.length" class="fio">
              <li v-for="c in chamado.comentarios" :key="c.id">
                <span class="avatar" aria-hidden="true">{{ iniciais(c.autor) }}</span>
                <div>
                  <p class="fio__cab"><strong>{{ c.autor }}</strong> <time>{{ formatarData(c.data) }}</time></p>
                  <p class="prose">{{ c.texto }}</p>
                </div>
              </li>
            </ol>
            <p v-else class="muted">Nenhum comentário ainda. Registre o primeiro andamento abaixo.</p>

            <form class="compositor" @submit.prevent="comentar">
              <p v-if="erroComentario" class="alert" role="alert">{{ erroComentario }}</p>
              <div class="field">
                <label for="autor">Seu nome</label>
                <input id="autor" v-model="autor" required maxlength="100" autocomplete="name" />
              </div>
              <div class="field">
                <label for="texto">Comentário</label>
                <textarea id="texto" v-model="texto" required maxlength="1000" rows="3" placeholder="O que foi feito ou o que falta" />
              </div>
              <div class="compositor__fim">
                <span class="muted">{{ texto.length }}/1000</span>
                <button type="submit" class="btn btn--primary" :disabled="enviando">Enviar comentário</button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <ConfirmDialog
        :open="confirmando === 'fechar'"
        title="Fechar este chamado?"
        message="Depois de fechado, o chamado não pode mais ser editado nem ter status ou técnico alterados. Comentários continuam permitidos."
        confirm-label="Fechar chamado"
        :perigo="false"
        :loading="ocupado"
        @confirm="fecharChamado"
        @cancel="confirmando = null"
      />
      <ConfirmDialog
        :open="confirmando === 'excluir'"
        title="Excluir este chamado?"
        message="Essa ação não pode ser desfeita. Chamados com comentários não podem ser excluídos pelo sistema."
        confirm-label="Excluir chamado"
        :loading="ocupado"
        @confirm="excluir"
        @cancel="confirmando = null"
      />
    </template>
  </section>
</template>

<style scoped>
.layout { display: grid; gap: 24px; padding-bottom: 72px; }
.lateral, .principal { display: grid; gap: 20px; align-content: start; min-width: 0; }
.lateral { order: -1; }
.lateral > .btn { justify-self: start; }
.painel { display: grid; gap: 14px; align-content: start; }
.selos { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.contagem { color: var(--mudo); font-weight: 600; }

.passos { display: grid; gap: 6px; }
.passo {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px;
  border: 1.5px solid var(--borda-ctl); border-radius: 8px; background: var(--papel);
  font-weight: 600; text-align: left;
}
.passo::before { content: ''; width: 10px; height: 10px; border-radius: 50%; background: var(--t-dot); flex: none; }
.passo:hover:not(:disabled):not(.is-atual) { background: #f3f6fa; }
.passo.is-atual { background: var(--t-bg); border-color: var(--t-dot); color: var(--t-fg); }
.passo:disabled:not(.is-atual) { opacity: .55; cursor: not-allowed; }
.passo.is-atual:disabled { cursor: default; }

.inline { display: flex; gap: 8px; flex-wrap: wrap; }
.inline select { flex: 1 1 160px; width: auto; }

.dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin: 0; }
.dl dt { color: var(--mudo); }
.dl dd { margin: 0; font-weight: 600; text-align: right; }

.fio { display: grid; gap: 18px; }
.fio li { display: grid; grid-template-columns: auto 1fr; gap: 12px; }
.fio__cab { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; }
.fio__cab time { color: var(--mudo); font-size: .9rem; }

.compositor { display: grid; gap: 14px; padding-top: 18px; border-top: 1px solid var(--linha); }
.compositor__fim { display: flex; justify-content: space-between; align-items: center; gap: 12px; }

@media (min-width: 960px) {
  .layout { grid-template-columns: minmax(0, 1fr) 340px; align-items: start; }
  .principal { grid-column: 1; grid-row: 1; }
  .lateral { order: 0; grid-column: 2; grid-row: 1; position: sticky; top: 88px; }
}
</style>
