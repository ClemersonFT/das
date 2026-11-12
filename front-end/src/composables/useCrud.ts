import { ref, shallowRef } from 'vue'
import { errosDeCampo, mensagemDeErro, mensagemExclusao } from '../api/http'
import { useToast } from './useToast'

interface Config<T extends { id: number }, I extends object> {
  form: I
  vazio: () => I
  doItem: (item: T) => I
  criar: (dados: I) => Promise<unknown>
  atualizar: (id: number, dados: I) => Promise<unknown>
  excluir: (id: number) => Promise<void>
  recarregar: () => Promise<void>
  textos: { criado: string; atualizado: string; excluido: string }
  rotulo: (item: T) => string
}

/** Estado e ações comuns às telas de cadastro: modal de criar/editar e confirmação de exclusão. */
export function useCrud<T extends { id: number }, I extends object>(cfg: Config<T, I>) {
  const toast = useToast()
  const aberto = ref(false)
  const editando = shallowRef<T | null>(null)
  const salvando = ref(false)
  const erro = ref('')
  const erros = ref<Record<string, string>>({})
  const alvo = shallowRef<T | null>(null)
  const excluindo = ref(false)

  const limpar = () => {
    erro.value = ''
    erros.value = {}
  }

  function novo() {
    editando.value = null
    Object.assign(cfg.form, cfg.vazio())
    limpar()
    aberto.value = true
  }

  function editar(item: T) {
    editando.value = item
    Object.assign(cfg.form, cfg.doItem(item))
    limpar()
    aberto.value = true
  }

  const fechar = () => {
    aberto.value = false
  }

  async function salvar() {
    salvando.value = true
    limpar()
    try {
      if (editando.value) await cfg.atualizar(editando.value.id, cfg.form)
      else await cfg.criar(cfg.form)
      toast.ok(editando.value ? cfg.textos.atualizado : cfg.textos.criado)
      aberto.value = false
      await cfg.recarregar()
    } catch (e) {
      erros.value = errosDeCampo(e)
      erro.value = mensagemDeErro(e)
    } finally {
      salvando.value = false
    }
  }

  const pedirExclusao = (item: T) => {
    alvo.value = item
  }
  const cancelarExclusao = () => {
    alvo.value = null
  }

  async function confirmarExclusao() {
    const item = alvo.value
    if (!item) return
    excluindo.value = true
    try {
      await cfg.excluir(item.id)
      toast.ok(cfg.textos.excluido)
      await cfg.recarregar()
    } catch (e) {
      toast.erro(mensagemExclusao(e, cfg.rotulo(item)))
    } finally {
      alvo.value = null
      excluindo.value = false
    }
  }

  return {
    aberto, editando, salvando, erro, erros, alvo, excluindo,
    novo, editar, fechar, salvar, pedirExclusao, cancelarExclusao, confirmarExclusao,
  }
}
