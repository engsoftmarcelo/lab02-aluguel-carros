import { Link } from 'react-router-dom'

/** Marca TRAÇO: um ponto (o pedido) e um traço que desenha o carro (o contrato). */
export function LogoMarca({ className = '' }) {
  return (
    <svg className={`logo__marca ${className}`} viewBox="0 0 64 28" fill="none" aria-hidden="true">
      <circle cx="5" cy="21" r="2.6" fill="var(--accent)" />
      <path
        d="M9 21H17C22 21 23.5 11.5 31 9.5C38.5 7.5 46 10.5 51 15.5L54.5 19C55.6 20.1 57.1 21 58.7 21H61"
        stroke="var(--accent)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="80"
      />
    </svg>
  )
}

export default function Logo({ to = '/', animado = false, semNome = false }) {
  return (
    <Link to={to} className={`logo ${animado ? 'logo--animado' : ''}`} aria-label="TRAÇO, página inicial">
      <LogoMarca />
      {!semNome && <span className="logo__nome">TRAÇO</span>}
    </Link>
  )
}
