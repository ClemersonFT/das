<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '../api'
import { mensagemDeErro } from '../api/http'
import type { Categoria } from '../api/types'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import FormField from '../components/FormField.vue'
import Modal from '../components/Modal.vue'
import PageFoot from '../components/PageFoot.vue'
import PageHead from '../components/PageHead.vue'
import SearchBox from '../components/SearchBox.vue'
import StateBox from '../components/StateBox.vue'
import { useCrud } from '../composables/useCrud'
import { useLookups } from '../composables/useLookups'
import { normalizar } from '../utils'

const { categorias, carregado, carregar } = useLookups()
const busca = ref('')
const erroCarga = ref('')

async function recarregar() {
  erroCarga.value = ''
  try {
    await carregar(true)
  } catch (e) {
    erroCarga.value = mensagemDeErro(e)
  }
}
onMounted(recarregar)

const filtradas = computed(() => {
  const termo = normalizar(busca.value)
  return categorias.value.filter((c) => normalizar(`${c.nome} ${c.descricao ?? ''}`).includes(termo))
})

const form = reactive({ nome: '', descricao: '' })
const { aberto, editando, salvando, erro, erros, alvo, excluindo, novo, editar, fechar, salvar, pedirExclusao, cancelarExclusao, confirmarExclusao } =
  useCrud({
    form,
    vazio: () => ({ nome: '', descricao: '' }),
    doItem: (c: Categoria) => ({ nome: c.nome, descricao: c.descricao ?? '' }),
    criar: (f) => api.categorias.criar({ nome: f.nome.trim(), descricao: f.descricao.trim() || null }),
    atualizar: (id, f) => api.categorias.atualizar(id, { nome: f.nome.trim(), descricao: f.descricao.trim() || null }),
    excluir: api.categorias.excluir,
    recarregar,
    textos: { criado: 'Categoria criada', atualizado: 'Alterações salvas', excluido: 'Categoria excluída' },
    rotulo: (c: Categoria) => c.nome,
  })
</script>

<template>
  <section>
    <PageHead title="Categorias" lede="Como os chamados são classificados. O nome não pode se repetir.">
      <button type="button" class="btn" @click="novo">Criar categoria</button>
    </PageHead>

    <div class="toolbar"><SearchBox v-model="busca" placeholder="Buscar por nome ou descrição" /></div>

    <StateBox v-if="erroCarga" tone="erro" title="Não foi possível carregar as categorias" :text="erroCarga">
      <button type="button" class="btn" @click="recarregar">Tentar de novo</button>
    </StateBox>
    <StateBox v-else-if="!carregado" tone="carregando" title="Carregando categorias" />
    <StateBox v-else-if="!categorias.length" title="Nenhuma categoria criada" text="Crie a primeira categoria para classificar os chamados.">
      <button type="button" class="btn btn--primary" @click="novo">Criar categoria</button>
    </StateBox>
    <StateBox v-else-if="!filtradas.length" title="Nenhuma categoria encontrada" :text="`Nada corresponde a “${busca}”.`" />
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Nome</th><th>Descrição</th><th class="col-acoes"><span class="sr-only">Ações</span></th></tr>
        </thead>
        <tbody>
          <tr v-for="c in filtradas" :key="c.id">
            <td class="cell-title">{{ c.nome }}</td>
            <td :class="{ muted: !c.descricao }">{{ c.descricao || 'Sem descrição' }}</td>
            <td class="col-acoes">
              <button type="button" class="btn btn--sm" @click="editar(c)">Editar</button>
              <button type="button" class="btn btn--sm btn--danger" @click="pedirExclusao(c)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PageFoot>
      <template #left><span class="muted">{{ categorias.length }} {{ categorias.length === 1 ? 'categoria' : 'categorias' }}</span></template>
      <template #right><button type="button" class="btn btn--primary" @click="novo">Criar categoria</button></template>
    </PageFoot>

    <Modal :open="aberto" :title="editando ? 'Editar categoria' : 'Nova categoria'" @close="fechar">
      <form id="form-categoria" class="form" @submit.prevent="salvar">
        <p v-if="erro" class="alert" role="alert">{{ erro }}</p>
        <FormField v-slot="{ id }" label="Nome" :erro="erros.nome">
          <input :id="id" v-model="form.nome" required maxlength="100" autofocus autocomplete="off" />
        </FormField>
        <FormField v-slot="{ id }" label="Descrição" dica="Opcional, até 255 caracteres." :erro="erros.descricao">
          <textarea :id="id" v-model="form.descricao" maxlength="255" rows="3" />
        </FormField>
      </form>
      <template #footer>
        <button type="button" class="btn btn--ghost" @click="fechar">Cancelar</button>
        <button type="submit" form="form-categoria" class="btn btn--primary" :disabled="salvando">
          {{ editando ? 'Salvar alterações' : 'Criar categoria' }}
        </button>
      </template>
    </Modal>

    <ConfirmDialog
      :open="!!alvo"
      :title="`Excluir ${alvo?.nome ?? 'categoria'}?`"
      message="A categoria será removida. Se ela estiver em uso por chamados, o sistema não permite a exclusão."
      confirm-label="Excluir categoria"
      :loading="excluindo"
      @confirm="confirmarExclusao"
      @cancel="cancelarExclusao"
    />
  </section>
</template>
