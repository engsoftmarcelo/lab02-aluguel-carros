/** Formatação e máscaras (pt-BR). */

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dataCurta = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })

export const formatarMoeda = (v) => moeda.format(Number(v || 0))

/** "2026-12-04" → "04 de dez. de 2026" (datas da API são LocalDate, sem fuso). */
export function formatarData(iso) {
  if (!iso) return '—'
  const [a, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  return dataCurta.format(new Date(Date.UTC(a, m - 1, d)))
}

export const somenteDigitos = (v = '') => String(v).replace(/\D/g, '')

export function mascaraCPF(v) {
  const d = somenteDigitos(v).slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

export function mascaraCNPJ(v) {
  const d = somenteDigitos(v).slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

/** Placa: maiúsculas, sem hífen, 7 caracteres (ABC1D23 ou ABC1234). */
export const mascaraPlaca = (v = '') =>
  String(v)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7)

/** "ABC1D23" → "ABC·1D23" para exibição. */
export const exibirPlaca = (p = '') => (p.length === 7 ? `${p.slice(0, 3)}·${p.slice(3)}` : p)

export const formatarCPF = (v) => mascaraCPF(v)
export const formatarCNPJ = (v) => mascaraCNPJ(v)

/** Diferença em dias entre duas datas ISO (mínimo 1, como no backend). */
export function diarias(inicio, fim) {
  if (!inicio || !fim) return 0
  const ms = new Date(`${fim}T00:00:00Z`) - new Date(`${inicio}T00:00:00Z`)
  return Math.max(1, Math.round(ms / 86400000))
}

export function hojeISO(somarDias = 0) {
  const d = new Date()
  d.setDate(d.getDate() + somarDias)
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/** Parcela pela Tabela Price (igual ao backend). */
export function parcelaPrice(valor, taxaPercentual, parcelas) {
  const pv = Number(valor) || 0
  const n = Number(parcelas) || 0
  const i = (Number(taxaPercentual) || 0) / 100
  if (!pv || !n) return 0
  if (i === 0) return pv / n
  const f = (1 + i) ** n
  return (pv * i * f) / (f - 1)
}

export const PAPEL_LABEL = { CLIENTE: 'Cliente', EMPRESA: 'Empresa', BANCO: 'Banco' }
