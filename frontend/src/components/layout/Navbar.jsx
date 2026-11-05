import { useEffect, useState } from 'react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import { homeDoPapel, useAuth } from '../../context/AuthContext'

/** Navbar da landing: transparente no topo, sólida ao rolar. */
export default function Navbar() {
  const [solida, setSolida] = useState(false)
  const { autenticado, usuario } = useAuth()

  useEffect(() => {
    const onScroll = () => setSolida(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${solida ? 'navbar--solida' : ''}`}>
      <div className="container navbar__inner">
        <Logo animado />
        <nav className="navbar__links" aria-label="Seções">
          <a href="#como-funciona">Como funciona</a>
          <a href="#frota">Frota</a>
          <a href="#parceiros">Empresas e bancos</a>
        </nav>
        <div className="navbar__acoes">
          {autenticado ? (
            <Button variant="primary" size="sm" to={homeDoPapel(usuario?.papel)}>
              Ir para o painel
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/entrar">
                Entrar
              </Button>
              <Button variant="primary" size="sm" to="/cadastro">
                Começar agora
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
