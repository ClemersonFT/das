import type { Page } from './types'

const BASE = '/api'
const SEM_RESPOSTA = 'Não consegui falar com a API. Confirme que o back-end está rodando em http://localhost:8080 e tente de novo.'

export class ApiError extends Error {
  /** status 0 = a API não respondeu (back-end desligado ou proxy sem destino). */
  constructor(public status: number, message: string, public detalhes: string[] = []) {
    super(message)
  }
}

type Query = Record<string, string | number | undefined | null>
interface Opcoes { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; query?: Query }

const PADRAO: Record<number, string> = {
  400: 'A requisição é inválida.',
  404: 'Registro não encontrado.',
  409: 'A operação entra em conflito com dados já existentes.',
}

export async function request<T>(caminho: string, { method = 'GET', body, query }: Opcoes = {}): Promise<T> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  const qs = params.toString()

  let res: Response
  try {
    res = await fetch(`${BASE}${caminho}${qs ? `?${qs}` : ''}`, {
      method,
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, SEM_RESPOSTA)
  }

  if (res.status === 204) return undefined as T
  const ehJson = res.headers.get('content-type')?.includes('application/json') ?? false
  const dados = ehJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    // ErroResposta do GlobalExceptionHandler: { momento, status, erro, detalhes }
    if (dados?.erro) throw new ApiError(res.status, dados.erro, dados.detalhes ?? [])
    // Sem JSON = quem respondeu foi o proxy do Vite, ou seja, o Spring está fora do ar.
    if (!ehJson) throw new ApiError(0, SEM_RESPOSTA)
    throw new ApiError(res.status, PADRAO[res.status] ?? 'Erro inesperado no servidor.')
  }
  return dados as T
}

interface Meta { totalElements: number; totalPages: number; number: number; size: number }
type PageBruto<T> = { content: T[] } & (Meta | { page: Meta })

export async function requestPage<T>(caminho: string, opcoes: Opcoes = {}): Promise<Page<T>> {
  const bruto = await request<PageBruto<T>>(caminho, opcoes)
  // Spring Data pode serializar os metadados na raiz ou dentro de "page".
  const meta = 'page' in bruto ? bruto.page : bruto
  return { content: bruto.content, totalElements: meta.totalElements, totalPages: meta.totalPages, number: meta.number, size: meta.size }
}

export const mensagemDeErro = (e: unknown) => (e instanceof ApiError ? e.message : 'Algo deu errado. Tente de novo.')

export function mensagemExclusao(e: unknown, alvo: string) {
  if (e instanceof ApiError && e.status >= 500)
    return `Não foi possível excluir ${alvo}: ele está em uso (pode haver chamados ou comentários vinculados).`
  return mensagemDeErro(e)
}

/** Converte detalhes "campo: mensagem" do Bean Validation em { campo: mensagem }. */
export function errosDeCampo(e: unknown): Record<string, string> {
  const campos: Record<string, string> = {}
  if (e instanceof ApiError)
    for (const d of e.detalhes) {
      const i = d.indexOf(': ')
      if (i > 0) campos[d.slice(0, i)] = d.slice(i + 2)
    }
  return campos
}
