import { Link } from 'react-router-dom'

/**
 * Símbolo ARREDOR: dois enquadramentos abertos (saída e chegada) que se encontram
 * em volta de um ponto — o próximo lugar. Sem volante, chave ou estrada.
 */
export function LogoMarca({ className = '' }) {
  return (
    <svg className={`logo__marca ${className}`} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 15V9.5A5.5 5.5 0 0 1 9.5 4H16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" pathLength="24" />
      <path d="M28 17v5.5a5.5 5.5 0 0 1-5.5 5.5H16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" pathLength="24" />
      <circle cx="16" cy="16" r="3.4" fill="var(--accent)" />
    </svg>
  )
}

/** Marca + descritor "Aluguel de carros" sempre por perto (evita confusão com hospedagem). */
export default function Logo({ to = '/', animado = false, semNome = false, descritor = true }) {
  return (
    <Link to={to} className={`logo ${animado ? 'logo--animado' : ''}`} aria-label="Arredor, aluguel de carros: página inicial">
      <LogoMarca />
      {!semNome && (
        <span className="logo__texto">
          <span className="logo__nome">arredor</span>
          {descritor && <span className="logo__descritor">Aluguel de carros</span>}
        </span>
      )}
    </Link>
  )
}
