import { AlertTriangle, RotateCcw } from 'lucide-react'
import Button from './Button'
import Skeleton from './Skeleton'

/** Ilustração do estado vazio: um traço que não chegou ao fim. */
function TracoVazio() {
  return (
    <svg className="estado__icone" viewBox="0 0 120 40" fill="none" aria-hidden="true">
      <circle cx="6" cy="30" r="3.5" fill="currentColor" />
      <path d="M12 30H30C37 30 39 16 50 13C61 10 72 15 79 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 26L90 30H114" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 6" opacity="0.5" />
    </svg>
  )
}

export function EstadoVazio({ titulo, texto, acao }) {
  return (
    <div className="estado">
      <TracoVazio />
      <p className="estado__titulo">{titulo}</p>
      {texto && <p>{texto}</p>}
      {acao && <div style={{ marginTop: 'var(--s-2)' }}>{acao}</div>}
    </div>
  )
}

export function EstadoErro({ mensagem, onTentar }) {
  return (
    <div className="estado" role="alert" style={{ borderColor: 'rgba(255,107,107,0.4)' }}>
      <AlertTriangle size={32} style={{ color: 'var(--danger)' }} aria-hidden="true" />
      <p className="estado__titulo">Não foi possível carregar</p>
      <p>{mensagem}</p>
      {onTentar && (
        <Button variant="secondary" size="sm" icon={RotateCcw} onClick={onTentar}>
          Tentar de novo
        </Button>
      )}
    </div>
  )
}

/** Lista de linhas-esqueleto enquanto carrega. */
export function CarregandoLista({ linhas = 4, altura = 72 }) {
  return (
    <div className="lista" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <Skeleton key={i} height={altura} radius="var(--radius-md)" />
      ))}
    </div>
  )
}
