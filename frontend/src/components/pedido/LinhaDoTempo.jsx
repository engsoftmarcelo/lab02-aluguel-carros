import { Ban, Check, Clock, FileSignature, X } from 'lucide-react'

/**
 * O "traço" do pedido: Pedido → Análise → Aprovado → Contrato.
 * Reprovado: a linha se interrompe em vermelho na análise. Cancelado: fica cinza e tracejada.
 */
export default function LinhaDoTempo({ status }) {
  const etapas = [
    { rotulo: 'Pedido' },
    { rotulo: 'Análise' },
    { rotulo: 'Aprovado' },
    { rotulo: 'Contrato' },
  ]
  const estados = {
    EM_ANALISE: ['feita', 'atual', 'futura', 'futura'],
    APROVADO: ['feita', 'feita', 'feita', 'futura'],
    CONTRATADO: ['feita', 'feita', 'feita', 'feita'],
    REPROVADO: ['feita', 'erro', 'futura', 'futura'],
    CANCELADO: ['feita', 'cancelada', 'futura', 'futura'],
  }[status] || ['feita', 'futura', 'futura', 'futura']

  if (status === 'REPROVADO') etapas[1].rotulo = 'Reprovado'
  if (status === 'CANCELADO') etapas[1].rotulo = 'Cancelado'
  if (status === 'EM_ANALISE') etapas[1].rotulo = 'Em análise'

  const icone = (estado, i) => {
    if (estado === 'erro') return <X size={14} />
    if (estado === 'cancelada') return <Ban size={14} />
    if (estado === 'atual') return <Clock size={14} />
    if (estado === 'feita') return i === 3 ? <FileSignature size={14} /> : <Check size={14} />
    return null
  }

  return (
    <ol className="linha-tempo" aria-label={`Andamento do pedido: ${etapas[estados.indexOf('atual')]?.rotulo || status}`}>
      {etapas.map((e, i) => {
        const estado = estados[i]
        const quebra = (status === 'REPROVADO' || status === 'CANCELADO') && i >= 1
        const linhaFeita = estado === 'feita' && estados[i + 1] && estados[i + 1] !== 'futura'
        const classes = [
          'linha-tempo__etapa',
          `linha-tempo__etapa--${estado}`,
          linhaFeita || (estado === 'feita' && estados[i + 1] === 'feita') ? 'linha-tempo__etapa--feita' : '',
          quebra ? 'linha-tempo__etapa--quebra' : '',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <li key={i} className={classes} aria-current={estado === 'atual' ? 'step' : undefined}>
            <span className="linha-tempo__no">{icone(estado, i)}</span>
            <span className="linha-tempo__rotulo">{e.rotulo}</span>
          </li>
        )
      })}
    </ol>
  )
}
