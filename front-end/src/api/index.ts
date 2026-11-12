import { request, requestPage } from './http'
import type {
  Categoria, CategoriaInput, Chamado, ChamadoDetalhe, ChamadoInput, Cliente, ClienteInput,
  Comentario, ComentarioInput, Prioridade, StatusChamado, Tecnico, TecnicoInput,
} from './types'

export interface PageQuery { page?: number; size?: number; sort?: string }
export interface ChamadoFiltro { status?: StatusChamado; prioridade?: Prioridade; clienteId?: number }

export const api = {
  clientes: {
    listar: () => request<Cliente[]>('/clientes'),
    buscar: (id: number) => request<Cliente>(`/clientes/${id}`),
    criar: (dto: ClienteInput) => request<Cliente>('/clientes', { method: 'POST', body: dto }),
    atualizar: (id: number, dto: ClienteInput) => request<Cliente>(`/clientes/${id}`, { method: 'PUT', body: dto }),
    excluir: (id: number) => request<void>(`/clientes/${id}`, { method: 'DELETE' }),
    chamados: (id: number, pagina: PageQuery = {}) => requestPage<Chamado>(`/clientes/${id}/chamados`, { query: { ...pagina } }),
  },
  categorias: {
    listar: () => request<Categoria[]>('/categorias'),
    criar: (dto: CategoriaInput) => request<Categoria>('/categorias', { method: 'POST', body: dto }),
    atualizar: (id: number, dto: CategoriaInput) => request<Categoria>(`/categorias/${id}`, { method: 'PUT', body: dto }),
    excluir: (id: number) => request<void>(`/categorias/${id}`, { method: 'DELETE' }),
  },
  tecnicos: {
    listar: () => request<Tecnico[]>('/tecnicos'),
    criar: (dto: TecnicoInput) => request<Tecnico>('/tecnicos', { method: 'POST', body: dto }),
    atualizar: (id: number, dto: TecnicoInput) => request<Tecnico>(`/tecnicos/${id}`, { method: 'PUT', body: dto }),
    excluir: (id: number) => request<void>(`/tecnicos/${id}`, { method: 'DELETE' }),
  },
  chamados: {
    listar: (filtro: ChamadoFiltro = {}, pagina: PageQuery = {}) =>
      requestPage<Chamado>('/chamados', { query: { ...filtro, ...pagina } }),
    buscar: (id: number) => request<ChamadoDetalhe>(`/chamados/${id}`),
    criar: (dto: ChamadoInput) => request<Chamado>('/chamados', { method: 'POST', body: dto }),
    atualizar: (id: number, dto: ChamadoInput) => request<Chamado>(`/chamados/${id}`, { method: 'PUT', body: dto }),
    atribuir: (id: number, tecnicoId: number) =>
      request<Chamado>(`/chamados/${id}/atribuir`, { method: 'PATCH', body: { tecnicoId } }),
    alterarStatus: (id: number, status: StatusChamado) =>
      request<Chamado>(`/chamados/${id}/status`, { method: 'PATCH', body: { status } }),
    excluir: (id: number) => request<void>(`/chamados/${id}`, { method: 'DELETE' }),
    comentar: (id: number, dto: ComentarioInput) =>
      request<Comentario>(`/chamados/${id}/comentarios`, { method: 'POST', body: dto }),
  },
}
