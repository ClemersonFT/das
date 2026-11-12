export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'
export type StatusChamado = 'ABERTO' | 'EM_ATENDIMENTO' | 'AGUARDANDO_CLIENTE' | 'FECHADO'
export type Perfil = 'ADMIN' | 'TECNICO'

export interface Cliente { id: number; nome: string; email: string; telefone: string | null }
export interface Categoria { id: number; nome: string; descricao: string | null }
export interface Tecnico { id: number; nome: string; email: string; perfil: Perfil }
export interface Comentario { id: number; texto: string; data: string; autor: string; chamadoId: number }
export interface Chamado {
  id: number
  titulo: string
  descricao: string | null
  dataAbertura: string
  dataFechamento: string | null
  prioridade: Prioridade
  status: StatusChamado
  clienteId: number
  categoriaId: number
  tecnicoId: number | null
}
export interface ChamadoDetalhe extends Chamado { comentarios: Comentario[] }

export interface ClienteInput { nome: string; email: string; telefone: string | null }
export interface CategoriaInput { nome: string; descricao: string | null }
export interface TecnicoInput { nome: string; email: string; perfil: Perfil }
export interface ChamadoInput {
  titulo: string
  descricao: string | null
  prioridade: Prioridade
  clienteId: number
  categoriaId: number
}
export interface ComentarioInput { texto: string; autor: string }

export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number }

export type Tom = 'azul' | 'laranja' | 'violeta' | 'verde' | 'vermelho' | 'cinza'

export const STATUS: Record<StatusChamado, { rotulo: string; plural: string; dica: string; tom: Tom }> = {
  ABERTO: { rotulo: 'Aberto', plural: 'Abertos', dica: 'esperando atendimento', tom: 'azul' },
  EM_ATENDIMENTO: { rotulo: 'Em atendimento', plural: 'Em atendimento', dica: 'com um técnico', tom: 'laranja' },
  AGUARDANDO_CLIENTE: { rotulo: 'Aguardando cliente', plural: 'Aguardando cliente', dica: 'esperando resposta', tom: 'violeta' },
  FECHADO: { rotulo: 'Fechado', plural: 'Fechados', dica: 'resolvidos', tom: 'verde' },
}

export const PRIORIDADE: Record<Prioridade, { rotulo: string; tom: Tom }> = {
  BAIXA: { rotulo: 'Baixa', tom: 'cinza' },
  MEDIA: { rotulo: 'Média', tom: 'azul' },
  ALTA: { rotulo: 'Alta', tom: 'laranja' },
  CRITICA: { rotulo: 'Crítica', tom: 'vermelho' },
}

export const PERFIL: Record<Perfil, string> = { ADMIN: 'Administrador', TECNICO: 'Técnico' }

export const STATUS_LIST = Object.keys(STATUS) as StatusChamado[]
export const PRIORIDADE_LIST = Object.keys(PRIORIDADE) as Prioridade[]
export const PERFIL_LIST = Object.keys(PERFIL) as Perfil[]
