<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'
import { errosDeCampo, mensagemDeErro } from '../api/http'
import { PRIORIDADE, PRIORIDADE_LIST, type ChamadoInput, type Prioridade } from '../api/types'
import FormField from '../components/FormField.vue'
import PageFoot from '../components/PageFoot.vue'
import PageHead from '../components/PageHead.vue'
import StateBox from '../components/StateBox.vue'
import { useLookups } from '../composables/useLookups'
import { useToast } from '../composables/useToast'
import { senha } from '../utils'

const props = defineProps<{ id?: string }>()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { clientes, categorias, carregar: carregarLookups } = useLookups()

const editando = computed(() => props.id !== undefined)
const voltar = computed(() => (props.id ? `/chamados/${props.id}` : '/chamados'))

const carregando = ref(true)
const erroCarga = ref('')
const salvando = ref(false)
const erro = ref('')
const erros = ref<Record<string, string>>({})
const fechado = ref(false)

const form = reactive({
  titulo: '',
  descricao: '',
  prioridade: 'MEDIA' as Prioridade,
  clienteId: (Number(route.query.clienteId) || '') as number | '',
  categoriaId: '' as number | '',
})

onMounted(async () => {
  try {
    const [c] = await Promise.all([props.id ? api.chamados.buscar(Number(props.id)) : null, carregarLookups()])
    if (c) {
      Object.assign(form, {
        titulo: c.titulo,
        descricao: c.descricao ?? '',
        prioridade: c.prioridade,
        clienteId: c.clienteId,
        categoriaId: c.categoriaId,
      })
      fechado.value = c.status === 'FECHADO'
    }
  } catch (e) {
    erroCarga.value = mensagemDeErro(e)
  } finally {
    carregando.value = false
  }
})

async function salvar() {
  salvando.value = true
  erro.value = ''
  erros.value = {}
  const dto: ChamadoInput = {
    titulo: form.titulo.trim(),
    descricao: form.descricao.trim() || null,
    prioridade: form.prioridade,
    clienteId: Number(form.clienteId),
    categoriaId: Number(form.categoriaId),
  }
  try {
    const salvo = props.id ? await api.chamados.atualizar(Number(props.id), dto) : await api.chamados.criar(dto)
    toast.ok(props.id ? 'Alterações salvas' : `Chamado ${senha(salvo.id)} aberto`)
    router.replace(`/chamados/${salvo.id}`)
  } catch (e) {
    erros.value = errosDeCampo(e)
    erro.value = mensagemDeErro(e)
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <section>
    <StateBox v-if="erroCarga" tone="erro" title="Não foi possível carregar o formulário" :text="erroCarga">
      <RouterLink to="/chamados" class="btn">Voltar para chamados</RouterLink>
    </StateBox>
    <StateBox v-else-if="carregando" tone="carregando" title="Carregando" />

    <form v-else @submit.prevent="salvar">
      <PageHead
        :title="editando ? 'Editar chamado' : 'Abrir chamado'"
        :lede="editando ? 'O cliente não pode ser trocado depois que o chamado é aberto.' : 'O chamado nasce aberto e a data de abertura é registrada automaticamente.'"
      >
        <template #voltar><RouterLink :to="voltar" class="crumb">{{ editando ? 'Voltar para o chamado' : 'Voltar para chamados' }}</RouterLink></template>
      </PageHead>

      <p v-if="fechado" class="alert" role="alert">Este chamado está fechado e não pode mais ser alterado.</p>
      <p v-if="erro" class="alert" role="alert">{{ erro }}</p>
      <p v-if="!clientes.length || !categorias.length" class="alert alert--info">
        Para abrir um chamado é preciso ter pelo menos um
        <RouterLink v-if="!clientes.length" to="/clientes" class="link">cliente</RouterLink>
        <template v-if="!clientes.length && !categorias.length"> e uma </template>
        <RouterLink v-if="!categorias.length" to="/categorias" class="link">categoria</RouterLink>
        cadastrados.
      </p>

      <fieldset class="painel form-grid" :disabled="fechado || salvando">
        <FormField v-slot="{ id }" class="span-2" label="Título" :erro="erros.titulo">
          <input :id="id" v-model="form.titulo" required maxlength="150" autofocus autocomplete="off" placeholder="Ex.: Computador não liga" />
        </FormField>

        <FormField v-slot="{ id }" label="Cliente" :erro="erros.clienteId">
          <select :id="id" v-model="form.clienteId" required :disabled="editando">
            <option value="" disabled>Selecione um cliente</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </FormField>

        <FormField v-slot="{ id }" label="Categoria" :erro="erros.categoriaId">
          <select :id="id" v-model="form.categoriaId" required>
            <option value="" disabled>Selecione uma categoria</option>
            <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </FormField>

        <fieldset class="field span-2">
          <legend>Prioridade</legend>
          <div class="segmentado">
            <label v-for="p in PRIORIDADE_LIST" :key="p" :class="`tom-${PRIORIDADE[p].tom}`">
              <input v-model="form.prioridade" type="radio" name="prioridade" :value="p" />
              <span>{{ PRIORIDADE[p].rotulo }}</span>
            </label>
          </div>
          <p v-if="erros.prioridade" class="field__erro">{{ erros.prioridade }}</p>
        </fieldset>

        <FormField v-slot="{ id }" class="span-2" label="Descrição" dica="Opcional, até 1000 caracteres." :erro="erros.descricao">
          <textarea :id="id" v-model="form.descricao" maxlength="1000" rows="6" placeholder="O que aconteceu, desde quando e o que já foi tentado" />
        </FormField>
      </fieldset>

      <PageFoot>
        <template #left><RouterLink :to="voltar" class="btn btn--ghost">Cancelar</RouterLink></template>
        <template #right>
          <button type="submit" class="btn btn--primary btn--lg" :disabled="salvando || fechado || !clientes.length || !categorias.length">
            {{ editando ? 'Salvar alterações' : 'Abrir chamado' }}
          </button>
        </template>
      </PageFoot>
    </form>
  </section>
</template>
