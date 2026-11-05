import { Suspense } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import Sidebar, { UsuarioChip } from './Sidebar'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

/** Estrutura das áreas logadas: sidebar (desktop) / barra inferior (mobile) + conteúdo com transição. */
export default function AppShell() {
  const local = useLocation()
  const reduzir = useReducedMotion()
  const { usuario, isAgente, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="shell">
      <a href="#conteudo" className="pular">
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className="conteudo">
        <header className="topbar">
          <div className="topbar__logo-mobile">
            <Logo to={isAgente ? '/agente' : '/app'} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <UsuarioChip usuario={usuario} />
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              aria-label="Sair"
              onClick={() => {
                logout()
                navigate('/entrar', { replace: true })
              }}
            />
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.main
            id="conteudo"
            key={local.pathname}
            className="pagina"
            initial={reduzir ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <Suspense
              fallback={
                <div className="carregando-rota" role="status" aria-label="Carregando">
                  <span />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
