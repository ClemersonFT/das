// O Spring devolve LocalDateTime com até 6 casas decimais; o Date do JS aceita 3.
const aparar = (iso: string) => iso.replace(/(\.\d{3})\d+/, '$1')

export function formatarData(iso: string | null | undefined, longa = false): string {
  if (!iso) return '—'
  const d = new Date(aparar(iso))
  if (Number.isNaN(d.getTime())) return '—'
  return longa
    ? d.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
    : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

/** Número do chamado no estilo de senha de fila: 12 vira 0012. */
export const senha = (id: number) => String(id).padStart(4, '0')

export const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export const iniciais = (nome: string) =>
  nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
