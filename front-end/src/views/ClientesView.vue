<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '../api'
import { mensagemDeErro } from '../api/http'
import type { Cliente } from '../api/types'
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

const { clientes, carregado, carregar } = useLookups()
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
  return clientes.value.filter((c) => normalizar(`${c.nome} ${c.email} ${c.telefone ?? ''}`).includes(termo))
})

const form = reactive({ nome: '', email: '', telefone: '' })
const { aberto, editando, salvando, erro, erros, alvo, excluindo, novo, editar, fechar, salvar, pedirExclusao, cancelarExclusao, confirmarExclusao } =
  useCrud({
    form,
    vazio: () => ({ nome: '', email: '', telefone: '' }),
    doItem: (c: Cliente) => ({ nome: c.nome, email: c.email, telefone: c.telefone ?? '' }),
    criar: (f) => api.clientes.criar({ ...f, telefone: f.telefone.trim() || null }),
    atualizar: (id, f) => api.clientes.atualizar(id, { ...f, telefone: f.telefone.trim() || null }),
    excluir: api.clientes.excluir,
    recarregar,
    textos: { criado: 'Cliente cadastrado', atualizado: 'Alterações salvas', excluido: 'Cliente excluído' },
    rotulo: (c: Cliente) => c.nome,
  })
</script>

<template>
  <section>
    <PageHead title="Clientes" lede="Quem abre chamados. O e-mail não pode se repetir.">
      <button type="button" class="btn" @click="novo">Cadastrar cliente</button>
    </PageHead>

    <div class="toolbar"><SearchBox v-model="busca" placeholder="Buscar por nome, e-mail ou telefone" /></div>

    <StateBox v-if="erroCarga" tone="erro" title="Não foi possível carregar os clientes" :text="erroCarga">
      <button type="button" class="btn" @click="recarregar">Tentar de novo</button>
    </StateBox>
    <StateBox v-else-if="!carregado" tone="carregando" title="Carregando clientes" />
    <StateBox v-else-if="!clientes.length" title="Nenhum cliente cadastrado" text="Cadastre o primeiro cliente para poder abrir chamados.">
      <button type="button" class="btn btn--primary" @click="novo">Cadastrar cliente</button>
    </StateBox>
    <StateBox v-else-if="!filtrados.length" title="Nenhum cliente encontrado" :text="`Nada corresponde a “${busca}”.`" />
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th class="col-acoes"><span class="sr-only">Ações</span></th></tr>
        </thead>
        <tbody>
          <tr v-for="c in filtrados" :key="c.id">
            <td>
              <span class="pessoa">
                <span class="avatar" aria-hidden="true">{{ iniciais(c.nome) }}</span>
                <RouterLink :to="`/clientes/${c.id}`" class="cell-title">{{ c.nome }}</RouterLink>
              </span>
            </td>
            <td>{{ c.email }}</td>
            <td :class="{ muted: !c.telefone }">{{ c.telefone || 'Não informado' }}</td>
            <td class="col-acoes">
              <button type="button" class="btn btn--sm" @click="editar(c)">Editar</button>
              <button type="button" class="btn btn--sm btn--danger" @click="pedirExclusao(c)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PageFoot>
      <template #left><span class="muted">{{ clientes.length }} {{ clientes.length === 1 ? 'cliente' : 'clientes' }}</span></template>
      <template #right><button type="button" class="btn btn--primary" @click="novo">Cadastrar cliente</button></template>
    </PageFoot>

    <Modal :open="aberto" :title="editando ? 'Editar cliente' : 'Novo cliente'" @close="fechar">
      <form id="form-cliente" class="form" @submit.prevent="salvar">
        <p v-if="erro" class="alert" role="alert">{{ erro }}</p>
        <FormField v-slot="{ id }" label="Nome" :erro="erros.nome">
          <input :id="id" v-model="form.nome" required maxlength="100" autofocus autocomplete="off" />
        </FormField>
        <FormField v-slot="{ id }" label="E-mail" :erro="erros.email">
          <input :id="id" v-model="form.email" type="email" required maxlength="120" autocomplete="off" />
        </FormField>
        <FormField v-slot="{ id }" label="Telefone" dica="Opcional, até 20 caracteres." :erro="erros.telefone">
          <input :id="id" v-model="form.telefone" maxlength="20" inputmode="tel" placeholder="47 99999-9999" autocomplete="off" />
        </FormField>
      </form>
      <template #footer>
        <button type="button" class="btn btn--ghost" @click="fechar">Cancelar</button>
        <button type="submit" form="form-cliente" class="btn btn--primary" :disabled="salvando">
          {{ editando ? 'Salvar alterações' : 'Cadastrar cliente' }}
        </button>
      </template>
    </Modal>

    <ConfirmDialog
      :open="!!alvo"
      :title="`Excluir ${alvo?.nome ?? 'cliente'}?`"
      message="O cliente será removido. Se ele tiver chamados, o sistema não permite a exclusão."
      confirm-label="Excluir cliente"
      :loading="excluindo"
      @confirm="confirmarExclusao"
      @cancel="cancelarExclusao"
    />
  </section>
</template>
