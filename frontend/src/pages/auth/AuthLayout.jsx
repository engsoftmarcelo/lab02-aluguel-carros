import Logo from '../../components/ui/Logo'

/** Moldura das telas de login/cadastro: foto real enquadrada + assinatura à esquerda, formulário à direita. */
export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <div className="auth__visual" aria-hidden="true">
        <figure className="auth__moldura">
          <img src="/frota/volkswagen-nivus-1400.webp" alt="" />
        </figure>
      </div>

      <div className="auth__texto">
        <Logo animado />
        <div>
          <p className="label" style={{ marginBottom: 'var(--s-4)' }}>
            Aluguel de carros · análise por empresas e bancos
          </p>
          <h2 className="display auth__titulo">
            Tem vida acontecendo <span className="accent">logo ali.</span>
          </h2>
        </div>
        <div className="auth__passos">
          <div className="auth__passo">
            <p className="label">01 — Pedido</p>
            <p>Escolha o carro e veja o total.</p>
          </div>
          <div className="auth__passo">
            <p className="label">02 — Análise</p>
            <p>Empresa ou banco dá o parecer.</p>
          </div>
          <div className="auth__passo">
            <p className="label">03 — Contrato</p>
            <p>Com ou sem crédito de banco.</p>
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
