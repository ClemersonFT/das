<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '../api'
import { mensagemDeErro } from '../api/http'
import { PERFIL, PERFIL_LIST, type Perfil, type Tecnico } from '../api/types'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import FormField from '../components/FormField.vue'
import Modal from '../components/Modal.vue'
import PageFoot from '../components/PageFoot.vue'
import PageHead from '../components/PageHead.vue'
import SearchBox from '../components/SearchBox.vue'
import StateBox from '../components/StateBox.vue'
import { useCrud } from '../composables/useCrud'
import { useLookups } from '../composables/useLookups'
import { iniciais, normalizar } from '../utils'

const { tecnicos, carregado, carregar } = useLookups()
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

const filtrados = computed(() => {
  const termo = normalizar(busca.value)
  return tecnicos.value.filter((t) => normalizar(`${t.nome} ${t.email} ${PERFIL[t.perfil]}`).includes(termo))
})

const form = reactive({ nome: '', email: '', perfil: 'TECNICO' as Perfil })
const { aberto, editando, salvando, erro, erros, alvo, excluindo, novo, editar, fechar, salvar, pedirExclusao, cancelarExclusao, confirmarExclusao } =
  useCrud({
    form,
    vazio: () => ({ nome: '', email: '', perfil: 'TECNICO' as Perfil }),
    doItem: (t: Tecnico) => ({ nome: t.nome, email: t.email, perfil: t.perfil }),
    criar: (f) => api.tecnicos.criar({ ...f }),
    atualizar: (id, f) => api.tecnicos.atualizar(id, { ...f }),
    excluir: api.tecnicos.excluir,
    recarregar,
    textos: { criado: 'Técnico cadastrado', atualizado: 'Alterações salvas', excluido: 'Técnico excluído' },
    rotulo: (t: Tecnico) => t.nome,
  })
</script>

<template>
  <section>
    <PageHead title="Técnicos" lede="Quem atende os chamados. O e-mail não pode se repetir.">
      <button type="button" class="btn" @click="novo">Cadastrar técnico</button>
    </PageHead>

    <div class="toolbar"><SearchBox v-model="busca" placeholder="Buscar por nome, e-mail ou perfil" /></div>

    <StateBox v-if="erroCarga" tone="erro" title="Não foi possível carregar os técnicos" :text="erroCarga">
      <button type="button" class="btn" @click="recarregar">Tentar de novo</button>
    </StateBox>
    <StateBox v-else-if="!carregado" tone="carregando" title="Carregando técnicos" />
    <StateBox v-else-if="!tecnicos.length" title="Nenhum técnico cadastrado" text="Cadastre o primeiro técnico para atribuir chamados.">
      <button type="button" class="btn btn--primary" @click="novo">Cadastrar técnico</button>
    </StateBox>
    <StateBox v-else-if="!filtrados.length" title="Nenhum técnico encontrado" :text="`Nada corresponde a “${busca}”.`" />
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th class="col-acoes"><span class="sr-only">Ações</span></th></tr>
        </thead>
        <tbody>
          <tr v-for="t in filtrados" :key="t.id">
            <td>
              <span class="pessoa">
                <span class="avatar" aria-hidden="true">{{ iniciais(t.nome) }}</span>
                <span class="cell-title">{{ t.nome }}</span>
              </span>
            </td>
            <td>{{ t.email }}</td>
            <td><span class="badge" :class="t.perfil === 'ADMIN' ? 'tom-violeta' : 'tom-cinza'">{{ PERFIL[t.perfil] }}</span></td>
            <td class="col-acoes">
              <button type="button" class="btn btn--sm" @click="editar(t)">Editar</button>
              <button type="button" class="btn btn--sm btn--danger" @click="pedirExclusao(t)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PageFoot>
      <template #left><span class="muted">{{ tecnicos.length }} {{ tecnicos.length === 1 ? 'técnico' : 'técnicos' }}</span></template>
      <template #right><button type="button" class="btn btn--primary" @click="novo">Cadastrar técnico</button></template>
    </PageFoot>

    <Modal :open="aberto" :title="editando ? 'Editar técnico' : 'Novo técnico'" @close="fechar">
      <form id="form-tecnico" class="form" @submit.prevent="salvar">
        <p v-if="erro" class="alert" role="alert">{{ erro }}</p>
        <FormField v-slot="{ id }" label="Nome" :erro="erros.nome">
          <input :id="id" v-model="form.nome" required maxlength="100" autofocus autocomplete="off" />
        </FormField>
        <FormField v-slot="{ id }" label="E-mail" :erro="erros.email">
          <input :id="id" v-model="form.email" type="email" required autocomplete="off" />
        </FormField>
        <FormField v-slot="{ id }" label="Perfil" :erro="erros.perfil">
          <select :id="id" v-model="form.perfil" required>
            <option v-for="p in PERFIL_LIST" :key="p" :value="p">{{ PERFIL[p] }}</option>
          </select>
        </FormField>
      </form>
      <template #footer>
        <button type="button" class="btn btn--ghost" @click="fechar">Cancelar</button>
        <button type="submit" form="form-tecnico" class="btn btn--primary" :disabled="salvando">
          {{ editando ? 'Salvar alterações' : 'Cadastrar técnico' }}
        </button>
      </template>
    </Modal>

    <ConfirmDialog
      :open="!!alvo"
      :title="`Excluir ${alvo?.nome ?? 'técnico'}?`"
      message="O técnico será removido. Se ele estiver atribuído a chamados, o sistema não permite a exclusão."
      confirm-label="Excluir técnico"
      :loading="excluindo"
      @confirm="confirmarExclusao"
      @cancel="cancelarExclusao"
    />
  </section>
</template>
