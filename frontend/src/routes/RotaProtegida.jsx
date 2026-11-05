import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homeDoPapel, useAuth } from '../context/AuthContext'
import { LogoMarca } from '../components/ui/Logo'

/**
 * Bloqueia rotas para quem não está logado e para papéis não permitidos.
 * papeis: lista de papéis aceitos (ex.: ['CLIENTE'] ou ['EMPRESA', 'BANCO']).
 */
export default function RotaProtegida({ papeis }) {
  const { autenticado, usuario, validando } = useAuth()
  const local = useLocation()

  // papel errado: redireciona na hora, sem esperar a validação da sessão no servidor
  if (usuario && papeis && !papeis.includes(usuario.papel)) {
    return <Navigate to={homeDoPapel(usuario.papel)} replace />
  }

  if (validando) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }} aria-busy="true">
        <div className="logo logo--animado" aria-label="Carregando">
          <LogoMarca />
        </div>
      </div>
    )
  }

  if (!autenticado) {
    return <Navigate to="/entrar" replace state={{ de: local.pathname }} />
  }

  if (papeis && !papeis.includes(usuario?.papel)) {
    return <Navigate to={homeDoPapel(usuario?.papel)} replace />
  }

  return <Outlet />
}

/** Para /entrar e /cadastro: quem já está logado vai direto para o seu painel. */
export function SomenteVisitante({ children }) {
  const { autenticado, usuario, validando } = useAuth()
  if (!validando && autenticado) return <Navigate to={homeDoPapel(usuario?.papel)} replace />
  return children
}
