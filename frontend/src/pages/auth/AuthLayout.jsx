import { useReducedMotion } from 'framer-motion'
import Logo from '../../components/ui/Logo'

/** Moldura das telas de login/cadastro: vídeo de rastros de luz + manifesto à esquerda, formulário à direita. */
export default function AuthLayout({ children }) {
  const reduzir = useReducedMotion()

  return (
    <div className="auth">
      <div className="auth__visual" aria-hidden="true">
        {reduzir ? (
          <img className="auth__video" src="/media/loop-poster.jpg" alt="" />
        ) : (
          <video className="auth__video" src="/media/loop.mp4" poster="/media/loop-poster.jpg" autoPlay muted loop playsInline />
        )}
        <div className="grain" />
      </div>

      <div className="auth__texto">
        <Logo animado />
        <div>
          <p className="label" style={{ marginBottom: 'var(--s-4)' }}>
            Aluguel de carros · análise por empresas e bancos
          </p>
          <h2 className="display auth__titulo">
            <span>O carro certo,</span>
            <span>
              no traço <span className="accent" style={{ display: 'inline' }}>certo.</span>
            </span>
          </h2>
        </div>
        <div className="auth__passos">
          <div className="auth__passo">
            <p className="label">01 — Pedido</p>
            <p>Escolha o carro e as datas.</p>
          </div>
          <div className="auth__passo">
            <p className="label">02 — Análise</p>
            <p>Empresas e bancos avaliam.</p>
          </div>
          <div className="auth__passo">
            <p className="label">03 — Contrato</p>
            <p>Assinado, com ou sem crédito.</p>
          </div>
        </div>
      </div>

      <div className="auth__painel">
        <div className="auth__topo-mobile">
          <Logo animado />
        </div>
        {children}
      </div>
    </div>
  )
}
