import { Ban, CheckCircle2, Clock, FileSignature, XCircle } from 'lucide-react'

export const STATUS = {
  EM_ANALISE: { label: 'Em análise', icon: Clock },
  APROVADO: { label: 'Aprovado', icon: CheckCircle2 },
  REPROVADO: { label: 'Reprovado', icon: XCircle },
  CANCELADO: { label: 'Cancelado', icon: Ban },
  CONTRATADO: { label: 'Contratado', icon: FileSignature },
}

export const ORDEM_STATUS = ['EM_ANALISE', 'APROVADO', 'CONTRATADO', 'REPROVADO', 'CANCELADO']

/** Badge de status do pedido: cor + ícone + texto (a cor nunca é a única pista). */
export default function StatusBadge({ status }) {
  const info = STATUS[status] || { label: status, icon: Clock }
  const Icone = info.icon
  return (
    <span className={`badge badge--${status}`}>
      {status === 'EM_ANALISE' ? <span className="badge__pulso" aria-hidden="true" /> : <Icone aria-hidden="true" />}
      {info.label}
    </span>
  )
}
